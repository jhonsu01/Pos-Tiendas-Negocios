const Register = require('../models/Register');
const Sale = require('../models/Sale');
const CashClosure = require('../models/CashClosure');

// Helper para convertir fecha a formato de Bogotá para queries
const getBogotaDateRange = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    // Crear fecha en UTC-5 (Bogotá)
    const startDate = `${year}-${month}-${day} 00:00:00`;
    // Usar el inicio del día siguiente para incluir todas las ventas del día actual
    const currentDate = new Date(year, month - 1, day);
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = String(nextDate.getMonth() + 1).padStart(2, '0');
    const nextDay = String(nextDate.getDate()).padStart(2, '0');
    const endDate = `${nextYear}-${nextMonth}-${nextDay} 00:00:00`;
    return { startDate, endDate };
};

// Helper para obtener fecha actual de Bogotá en formato YYYY-MM-DD
const getBogotaToday = () => {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const bogotaTime = new Date(utcTime - (5 * 3600000));
    const year = bogotaTime.getFullYear();
    const month = String(bogotaTime.getMonth() + 1).padStart(2, '0');
    const day = String(bogotaTime.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// @desc    Get all registers
// @route   GET /api/registers
// @access  Private
const getRegisters = (req, res) => {
    try {
        const registers = Register.findAll();
        res.json(registers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create register
// @route   POST /api/registers
// @access  Private/Admin
const createRegister = (req, res) => {
    try {
        const { name, description, categories } = req.body;
        const register = Register.create({ name, description, categories });
        res.status(201).json(register);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update register
// @route   PUT /api/registers/:id
// @access  Private/Admin
const updateRegister = (req, res) => {
    try {
        const { name, description, categories } = req.body;
        const register = Register.findById(req.params.id);

        if (register) {
            const updatedRegister = Register.update(req.params.id, {
                name: name || register.name,
                description: description !== undefined ? description : register.description,
                categories: categories !== undefined ? categories : register.categories,
            });
            res.json(updatedRegister);
        } else {
            res.status(404).json({ message: 'Caja no encontrada' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete register
// @route   DELETE /api/registers/:id
// @access  Private/Admin
const deleteRegister = (req, res) => {
    try {
        const register = Register.findById(req.params.id);

        if (register) {
            Register.deleteById(req.params.id);
            res.json({ message: 'Caja eliminada' });
        } else {
            res.status(404).json({ message: 'Caja no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get register sales summary (for closure)
// @route   GET /api/registers/:id/summary?date=YYYY-MM-DD
// @access  Private
const getRegisterSummary = (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date || getBogotaToday();
        const { startDate, endDate } = getBogotaDateRange(targetDate);

        const sales = Sale.findByRegisterAndDateRange(req.params.id, startDate, endDate);

        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const salesCount = sales.length;

        res.json({
            totalSales,
            salesCount,
            sales,
            date: targetDate,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Close cash register
// @route   POST /api/registers/:id/close
// @access  Private
const closeCashRegister = (req, res) => {
    try {
        const { openingBalance, closingBalance, notes, date } = req.body;
        const targetDate = date || getBogotaToday();
        const { startDate, endDate } = getBogotaDateRange(targetDate);

        const sales = Sale.findByRegisterAndDateRange(req.params.id, startDate, endDate);

        const totalSales = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
        const salesCount = sales.length;

        const closure = CashClosure.create({
            register: req.params.id,
            user: req.user._id,
            openingBalance: openingBalance || 0,
            closingBalance,
            totalSales,
            salesCount,
            notes,
            closedAt: targetDate,
        });

        res.status(201).json(closure);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get register closures
// @route   GET /api/registers/:id/closures
// @access  Private
const getRegisterClosures = (req, res) => {
    try {
        const closures = CashClosure.findByRegister(req.params.id, 30);
        res.json(closures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all closures with filters
// @route   GET /api/registers/closures/all
// @access  Private
const getAllClosures = (req, res) => {
    try {
        const { startDate, endDate, registerId } = req.query;
        const filters = {};

        if (registerId) filters.registerId = registerId;

        if (startDate) {
            const { startDate: start } = getBogotaDateRange(startDate);
            filters.startDate = start;
        }
        if (endDate) {
            const { endDate: end } = getBogotaDateRange(endDate);
            filters.endDate = end;
        }

        const closures = CashClosure.findAllWithFilters(filters);
        res.json(closures);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update closure
// @route   PUT /api/registers/closures/:id
// @access  Private/Admin
const updateClosure = (req, res) => {
    try {
        const { openingBalance, closingBalance, notes } = req.body;
        const closure = CashClosure.findById(req.params.id);

        if (closure) {
            const updatedClosure = CashClosure.update(req.params.id, {
                openingBalance, closingBalance, notes
            });
            res.json(updatedClosure);
        } else {
            res.status(404).json({ message: 'Cierre no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete closure
// @route   DELETE /api/registers/closures/:id
// @access  Private/Admin
const deleteClosure = (req, res) => {
    try {
        const closure = CashClosure.findById(req.params.id);

        if (closure) {
            CashClosure.deleteById(req.params.id);
            res.json({ message: 'Cierre eliminado' });
        } else {
            res.status(404).json({ message: 'Cierre no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get accumulated totals by register
// @route   GET /api/registers/accumulated
// @access  Private
const getAccumulatedByRegister = (req, res) => {
    try {
        const registers = Register.findAll();
        const SupplierPayment = require('../models/SupplierPayment');

        const accumulated = registers.map((register) => {
            const closures = CashClosure.findByRegisterRaw(register._id);
            const payments = SupplierPayment.findByRegister(register._id);

            const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
            const totalSales = closures.reduce((sum, closure) => sum + closure.totalSales, 0);
            const totalClosingBalance = closures.reduce((sum, closure) => sum + closure.closingBalance, 0);
            const totalOpeningBalance = closures.reduce((sum, closure) => sum + closure.openingBalance, 0);
            const closureCount = closures.length;
            const accumulatedCash = totalClosingBalance - totalOpeningBalance - totalPayments;

            return {
                register: {
                    _id: register._id,
                    name: register.name,
                    categories: register.categories,
                },
                totalSales,
                totalClosingBalance,
                totalOpeningBalance,
                totalPayments,
                accumulatedCash,
                closureCount,
                lastClosure: closures.length > 0 ? closures[closures.length - 1].closedAt : null,
            };
        });

        res.json(accumulated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRegisters,
    createRegister,
    updateRegister,
    deleteRegister,
    getRegisterSummary,
    closeCashRegister,
    getRegisterClosures,
    getAllClosures,
    updateClosure,
    deleteClosure,
    getAccumulatedByRegister,
};
