const readline = require('readline');
const bcrypt = require('bcryptjs');
const db = require('./database/connection');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (q) => new Promise(resolve => rl.question(q, resolve));

function listUsers() {
    const users = db.prepare('SELECT id, name, username, role, license_expires_at, created_at FROM users').all();
    console.log('\n=== USUARIOS REGISTRADOS ===\n');
    if (users.length === 0) {
        console.log('  No hay usuarios registrados.\n');
        return;
    }
    users.forEach(u => {
        const license = u.license_expires_at
            ? (new Date(u.license_expires_at) > new Date() ? `Expira: ${u.license_expires_at}` : 'EXPIRADA')
            : 'Lifetime (sin expiracion)';
        console.log(`  [${u.id}] ${u.name} (@${u.username}) - Rol: ${u.role} - Licencia: ${license}`);
    });
    console.log('');
}

async function createUser() {
    console.log('\n=== CREAR USUARIO ===\n');
    const name = await ask('  Nombre completo: ');
    const username = await ask('  Username: ');
    const password = await ask('  Password: ');
    const role = await ask('  Rol (admin/cashier) [cashier]: ') || 'cashier';

    if (!name || !username || !password) {
        console.log('  [ERROR] Nombre, username y password son obligatorios.\n');
        return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
        console.log('  [ERROR] El username ya existe.\n');
        return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(password, salt);

    db.prepare(`
        INSERT INTO users (name, username, password, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(name, username, hashed, role);

    console.log(`  [OK] Usuario "${username}" creado exitosamente.\n`);
}

async function resetPassword() {
    console.log('\n=== RESETEAR PASSWORD ===\n');
    listUsers();
    const id = await ask('  ID del usuario: ');
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id);

    if (!user) {
        console.log('  [ERROR] Usuario no encontrado.\n');
        return;
    }

    const newPass = await ask(`  Nueva password para @${user.username}: `);
    if (!newPass) {
        console.log('  [ERROR] Password no puede estar vacia.\n');
        return;
    }

    const salt = bcrypt.genSaltSync(10);
    const hashed = bcrypt.hashSync(newPass, salt);

    db.prepare("UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?").run(hashed, id);
    console.log(`  [OK] Password actualizada para @${user.username}.\n`);
}

async function changeRole() {
    console.log('\n=== CAMBIAR ROL ===\n');
    listUsers();
    const id = await ask('  ID del usuario: ');
    const user = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(id);

    if (!user) {
        console.log('  [ERROR] Usuario no encontrado.\n');
        return;
    }

    const newRole = user.role === 'admin' ? 'cashier' : 'admin';
    const confirm = await ask(`  Cambiar @${user.username} de "${user.role}" a "${newRole}"? (s/n): `);

    if (confirm.toLowerCase() === 's') {
        db.prepare("UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?").run(newRole, id);
        console.log(`  [OK] Rol cambiado a "${newRole}".\n`);
    } else {
        console.log('  Cancelado.\n');
    }
}

async function manageLicense() {
    console.log('\n=== GESTIONAR LICENCIA ===\n');
    listUsers();
    const id = await ask('  ID del usuario: ');
    const user = db.prepare('SELECT id, username, license_expires_at FROM users WHERE id = ?').get(id);

    if (!user) {
        console.log('  [ERROR] Usuario no encontrado.\n');
        return;
    }

    console.log(`\n  Usuario: @${user.username}`);
    console.log(`  Licencia actual: ${user.license_expires_at || 'Lifetime (sin expiracion)'}\n`);
    console.log('  Opciones:');
    console.log('    1. Establecer fecha de expiracion');
    console.log('    2. Renovar por X dias desde hoy');
    console.log('    3. Hacer lifetime (sin expiracion)');
    console.log('    0. Cancelar\n');

    const opt = await ask('  Opcion: ');

    switch (opt) {
        case '1': {
            const dateStr = await ask('  Fecha de expiracion (YYYY-MM-DD): ');
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
                console.log('  [ERROR] Fecha invalida.\n');
                return;
            }
            db.prepare("UPDATE users SET license_expires_at = ?, updated_at = datetime('now') WHERE id = ?")
                .run(date.toISOString(), id);
            console.log(`  [OK] Licencia expira: ${date.toISOString().split('T')[0]}\n`);
            break;
        }
        case '2': {
            const days = await ask('  Dias desde hoy: ');
            const d = parseInt(days);
            if (isNaN(d) || d <= 0) {
                console.log('  [ERROR] Numero invalido.\n');
                return;
            }
            const expires = new Date();
            expires.setDate(expires.getDate() + d);
            db.prepare("UPDATE users SET license_expires_at = ?, updated_at = datetime('now') WHERE id = ?")
                .run(expires.toISOString(), id);
            console.log(`  [OK] Licencia renovada hasta: ${expires.toISOString().split('T')[0]} (${d} dias)\n`);
            break;
        }
        case '3': {
            db.prepare("UPDATE users SET license_expires_at = NULL, updated_at = datetime('now') WHERE id = ?")
                .run(id);
            console.log('  [OK] Licencia establecida como lifetime (sin expiracion).\n');
            break;
        }
        default:
            console.log('  Cancelado.\n');
    }
}

async function deleteUser() {
    console.log('\n=== ELIMINAR USUARIO ===\n');
    listUsers();
    const id = await ask('  ID del usuario a eliminar: ');
    const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id);

    if (!user) {
        console.log('  [ERROR] Usuario no encontrado.\n');
        return;
    }

    const confirm = await ask(`  Seguro que deseas eliminar a @${user.username}? (s/n): `);
    if (confirm.toLowerCase() === 's') {
        db.prepare('DELETE FROM users WHERE id = ?').run(id);
        console.log(`  [OK] Usuario @${user.username} eliminado.\n`);
    } else {
        console.log('  Cancelado.\n');
    }
}

async function mainMenu() {
    console.clear();
    console.log('========================================');
    console.log('  ECOTIENDA POS - Gestion de Usuarios');
    console.log('========================================\n');

    while (true) {
        console.log('  1. Listar usuarios');
        console.log('  2. Crear usuario');
        console.log('  3. Resetear password');
        console.log('  4. Cambiar rol (admin/cashier)');
        console.log('  5. Gestionar licencia');
        console.log('  6. Eliminar usuario');
        console.log('  0. Salir\n');

        const opt = await ask('  Opcion: ');
        console.log('');

        switch (opt) {
            case '1': listUsers(); break;
            case '2': await createUser(); break;
            case '3': await resetPassword(); break;
            case '4': await changeRole(); break;
            case '5': await manageLicense(); break;
            case '6': await deleteUser(); break;
            case '0':
                console.log('  Hasta luego!\n');
                rl.close();
                process.exit(0);
            default:
                console.log('  Opcion no valida.\n');
        }
    }
}

mainMenu();
