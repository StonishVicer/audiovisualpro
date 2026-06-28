import { pool } from '../config/database.js'

export const TipoProyectoModel = {
    findAll() { return pool.query('SELECT * FROM tipos_proyecto ORDER BY id_tipo_proyecto ASC') },
    findById(id) { return pool.query('SELECT * FROM tipos_proyecto WHERE id_tipo_proyecto = $1', [id]) },
    create(nombre_tipo) { return pool.query('INSERT INTO tipos_proyecto (nombre_tipo) VALUES ($1) RETURNING *', [nombre_tipo]) },
    update(id, nombre_tipo) { return pool.query('UPDATE tipos_proyecto SET nombre_tipo=$1 WHERE id_tipo_proyecto=$2 RETURNING *', [nombre_tipo, id]) },
    remove(id) { return pool.query('DELETE FROM tipos_proyecto WHERE id_tipo_proyecto = $1 RETURNING *', [id]) }
}

export const EstadoProyectoModel = {
    findAll() { return pool.query('SELECT * FROM estados_proyecto ORDER BY id_estado_proyecto ASC') },
    findById(id) { return pool.query('SELECT * FROM estados_proyecto WHERE id_estado_proyecto = $1', [id]) },
    create(nombre_estado) { return pool.query('INSERT INTO estados_proyecto (nombre_estado) VALUES ($1) RETURNING *', [nombre_estado]) },
    update(id, nombre_estado) { return pool.query('UPDATE estados_proyecto SET nombre_estado=$1 WHERE id_estado_proyecto=$2 RETURNING *', [nombre_estado, id]) },
    remove(id) { return pool.query('DELETE FROM estados_proyecto WHERE id_estado_proyecto = $1 RETURNING *', [id]) }
}

export const RolPersonalModel = {
    findAll() { return pool.query('SELECT * FROM roles_personal ORDER BY id_rol ASC') },
    findById(id) { return pool.query('SELECT * FROM roles_personal WHERE id_rol = $1', [id]) },
    create(nombre_rol) { return pool.query('INSERT INTO roles_personal (nombre_rol) VALUES ($1) RETURNING *', [nombre_rol]) },
    update(id, nombre_rol) { return pool.query('UPDATE roles_personal SET nombre_rol=$1 WHERE id_rol=$2 RETURNING *', [nombre_rol, id]) },
    remove(id) { return pool.query('DELETE FROM roles_personal WHERE id_rol = $1 RETURNING *', [id]) }
}

export const StatsModel = {
    getFinanceStats() {
        return pool.query(`
            SELECT
                (SELECT COALESCE(SUM(total),0) FROM facturas WHERE estado = 'PAGADA') AS total_facturado,
                (SELECT COALESCE(SUM(total),0) FROM facturas WHERE estado = 'PENDIENTE') AS total_pendiente,
                (SELECT COALESCE(SUM(monto_gasto),0) FROM gastos) AS total_gastos,
                (SELECT COALESCE(SUM(monto_pagado),0) FROM pagos_personal) AS total_pagos_personal
        `)
    }
}
