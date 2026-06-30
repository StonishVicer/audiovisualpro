import { pool } from '../config/database.js'
import { ProyectoModel } from '../models/proyecto.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'

export const ProyectoService = {
    async findAll() {
        const result = await ProyectoModel.findAll()
        return result.rows
    },

    async findById(id) {
        const result = await ProyectoModel.findById(id)
        if (result.rows.length === 0) throw new NotFoundError('Proyecto no encontrado')
        return result.rows[0]
    },

    async create(data) {
        const result = await ProyectoModel.create(data)
        return result.rows[0]
    },

    async update(id, data) {
        const existing = await ProyectoModel.findById(id)
        if (existing.rows.length === 0) throw new NotFoundError('Proyecto no encontrado')
        const result = await ProyectoModel.update(id, data)
        return result.rows[0]
    },

    async remove(id) {
        const result = await ProyectoModel.remove(id)
        if (result.rows.length === 0) throw new NotFoundError('Proyecto no encontrado')
        return { message: 'Proyecto eliminado correctamente' }
    },

    async asignarLocacion(id_proyecto, id_locacion) {
        await pool.query(
            'INSERT INTO proyecto_locaciones (id_proyecto, id_locacion) VALUES ($1, $2)',
            [id_proyecto, id_locacion]
        )
        return { message: 'Locación asignada correctamente' }
    },

    async desasignarLocacion(idProyecto, idLocacion) {
        const result = await pool.query(
            'DELETE FROM proyecto_locaciones WHERE id_proyecto=$1 AND id_locacion=$2 RETURNING *',
            [idProyecto, idLocacion]
        )
        if (result.rows.length === 0) throw new NotFoundError('La asignación de locación no fue encontrada')
        return { message: 'Locación desasignada del proyecto' }
    },

    async asignarRecurso(id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso) {
        const result = await pool.query(
            'INSERT INTO uso_recurso (id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso) VALUES ($1,$2,$3,$4) RETURNING *',
            [id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso]
        )
        return { message: 'Recurso técnico asignado al proyecto', asignacion: result.rows[0] }
    },

    async desasignarRecurso(idProyecto, idRecurso) {
        const result = await pool.query(
            'DELETE FROM uso_recurso WHERE id_proyecto=$1 AND id_recurso=$2 RETURNING id_uso',
            [idProyecto, idRecurso]
        )
        if (result.rows.length === 0) throw new NotFoundError('Asignación no encontrada')
        return { message: 'Recurso técnico desasignado' }
    },

    async getAsignaciones(id) {
        const [locRes, recRes, persRes] = await Promise.all([
            pool.query(
                `SELECT l.id_locacion, l.nombre_locacion, l.direccion
                 FROM proyecto_locaciones pl
                 JOIN locaciones l ON pl.id_locacion = l.id_locacion
                 WHERE pl.id_proyecto = $1`, [id]),
            pool.query(
                `SELECT r.id_recurso, r.nombre_equipo, tr.nombre_tipo, ur.fecha_inicio_uso, ur.fecha_fin_uso
                 FROM uso_recurso ur
                 JOIN recurso_tecnico r ON ur.id_recurso = r.id_recurso
                 JOIN tipos_recurso tr ON r.id_tipo_recurso = tr.id_tipo_recurso
                 WHERE ur.id_proyecto = $1`, [id]),
            pool.query(
                `SELECT ap.id_asignacion, ap.id_personal, p.nombre_personal, rp.nombre_rol,
                        ap.horas_trabajadas, p.salario, p.cedula_personal, p.telefono, p.email_personal
                 FROM asignacion_personal ap
                 JOIN personal p ON ap.id_personal = p.id_personal
                 LEFT JOIN roles_personal rp ON p.id_rol = rp.id_rol
                 WHERE ap.id_proyecto = $1`, [id])
        ])
        return {
            locaciones: locRes.rows,
            recursos: recRes.rows,
            personal: persRes.rows
        }
    },

    async createProyectoCompleto({ proyecto, cliente, locaciones, recursos, personal, contrato }) {
        if (!proyecto || !proyecto.nombre || proyecto.id_tipo == null || proyecto.id_estado == null) {
            throw new ValidationError('Faltan campos obligatorios del proyecto')
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            const presupuesto = Number(proyecto.presupuesto) || 0
            const idTipo = Number(proyecto.id_tipo)
            const idEstado = Number(proyecto.id_estado)

            const proyectoResult = await client.query(
                `INSERT INTO proyectos (nombre_proyecto, id_tipo_proyecto, id_estado_proyecto, fecha_inicio, fecha_fin_estimada, presupuesto)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [proyecto.nombre, idTipo, idEstado, proyecto.fecha_inicio, proyecto.fecha_fin_estimada, presupuesto]
            )
            const idProyecto = proyectoResult.rows[0].id_proyecto

            let idCliente = null
            if (cliente) {
                if (cliente.id_cliente_existente) {
                    idCliente = cliente.id_cliente_existente
                } else if (cliente.nuevo) {
                    const { rif, nombre, email, telefono } = cliente.nuevo
                    const clienteResult = await client.query(
                        'INSERT INTO clientes (rif_cliente, nombre_cliente, email_cliente, telefono_cliente) VALUES ($1, $2, $3, $4) RETURNING id_cliente',
                        [rif, nombre, email, telefono]
                    )
                    idCliente = clienteResult.rows[0].id_cliente
                }
            }

            if (locaciones && locaciones.length > 0) {
                for (const loc of locaciones) {
                    let idLocacion = null
                    if (loc.id_locacion) {
                        idLocacion = loc.id_locacion
                    } else if (loc.nueva) {
                        const { nombre, direccion, descripcion } = loc.nueva
                        const locResult = await client.query(
                            'INSERT INTO locaciones (nombre_locacion, direccion, descripcion_locacion) VALUES ($1, $2, $3) RETURNING id_locacion',
                            [nombre, direccion, descripcion]
                        )
                        idLocacion = locResult.rows[0].id_locacion
                    }
                    if (idLocacion) {
                        await client.query(
                            'INSERT INTO proyecto_locaciones (id_proyecto, id_locacion) VALUES ($1, $2)',
                            [idProyecto, idLocacion]
                        )
                    }
                }
            }

            if (recursos && recursos.length > 0) {
                for (const rec of recursos) {
                    let idRecurso = null
                    if (rec.id_recurso) {
                        idRecurso = rec.id_recurso
                    } else if (rec.nuevo) {
                        const { nombre, id_tipo_recurso } = rec.nuevo
                        const recResult = await client.query(
                            'INSERT INTO recurso_tecnico (nombre_equipo, id_tipo_recurso) VALUES ($1, $2) RETURNING id_recurso',
                            [nombre, Number(id_tipo_recurso) || null]
                        )
                        idRecurso = recResult.rows[0].id_recurso
                    }
                    if (idRecurso) {
                        await client.query(
                            'INSERT INTO uso_recurso (id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso) VALUES ($1, $2, $3, $4)',
                            [idRecurso, idProyecto, rec.fecha_inicio_uso, rec.fecha_fin_uso]
                        )
                    }
                }
            }

            if (personal && personal.length > 0) {
                for (const pers of personal) {
                    let idPersonal = null
                    if (pers.id_personal) {
                        idPersonal = pers.id_personal
                    } else if (pers.nuevo) {
                        const { nombre_personal, cedula, tipo_identificacion, id_rol, salario, email, telefono, prefijo_telefono } = pers.nuevo
                        const persResult = await client.query(
                            `INSERT INTO personal (nombre_personal, cedula_personal, tipo_identificacion, id_rol, salario, email_personal, telefono, prefijo_telefono)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_personal`,
                            [nombre_personal, cedula, tipo_identificacion || 'V', Number(id_rol) || null, Number(salario) || 0, email, telefono, prefijo_telefono || null]
                        )
                        idPersonal = persResult.rows[0].id_personal
                    }
                    if (idPersonal) {
                        const hoy = new Date().toISOString().slice(0, 10)
                        await client.query(
                            'INSERT INTO asignacion_personal (id_proyecto, id_personal, horas_trabajadas, fecha_registro) VALUES ($1, $2, $3, $4)',
                            [idProyecto, idPersonal, Number(pers.horas_trabajadas) || 0, hoy]
                        )
                    }
                }
            }

            if (contrato && idCliente) {
                const fechaFirma = contrato.fecha_firma || new Date().toISOString().slice(0, 10)
                await client.query(
                    `INSERT INTO contratos (id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [idProyecto, idCliente, fechaFirma, proyecto.presupuesto || presupuesto, contrato.descripcion_servicios || 'Servicios de producción audiovisual']
                )
            }

            await client.query('COMMIT')

            return {
                message: 'Proyecto creado exitosamente con todas sus relaciones',
                id_proyecto: idProyecto,
                proyecto: proyectoResult.rows[0]
            }
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    },

    async updateProyectoCompleto(id, { proyecto, cliente, locaciones, recursos, personal, contrato }) {
        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            await client.query(
                `UPDATE proyectos SET nombre_proyecto=$1, id_tipo_proyecto=$2, id_estado_proyecto=$3, fecha_inicio=$4, fecha_fin_estimada=$5, presupuesto=$6
                 WHERE id_proyecto=$7`,
                [proyecto.nombre, proyecto.id_tipo, proyecto.id_estado, proyecto.fecha_inicio, proyecto.fecha_fin_estimada, proyecto.presupuesto, id]
            )

            let idCliente = null
            if (cliente) {
                if (cliente.id_cliente_existente) {
                    idCliente = cliente.id_cliente_existente
                } else if (cliente.nuevo) {
                    const { rif, nombre, email, telefono } = cliente.nuevo
                    const clienteResult = await client.query(
                        'INSERT INTO clientes (rif_cliente, nombre_cliente, email_cliente, telefono_cliente) VALUES ($1, $2, $3, $4) RETURNING id_cliente',
                        [rif, nombre, email, telefono]
                    )
                    idCliente = clienteResult.rows[0].id_cliente
                }
            }

            await client.query('DELETE FROM proyecto_locaciones WHERE id_proyecto = $1', [id])
            if (locaciones && locaciones.length > 0) {
                for (const loc of locaciones) {
                    let idLocacion = null
                    if (loc.id_locacion) {
                        idLocacion = loc.id_locacion
                    } else if (loc.nueva) {
                        const { nombre, direccion, descripcion } = loc.nueva
                        const locResult = await client.query(
                            'INSERT INTO locaciones (nombre_locacion, direccion, descripcion_locacion) VALUES ($1, $2, $3) RETURNING id_locacion',
                            [nombre, direccion, descripcion]
                        )
                        idLocacion = locResult.rows[0].id_locacion
                    }
                    if (idLocacion) {
                        await client.query(
                            'INSERT INTO proyecto_locaciones (id_proyecto, id_locacion) VALUES ($1, $2)',
                            [id, idLocacion]
                        )
                    }
                }
            }

            await client.query('DELETE FROM uso_recurso WHERE id_proyecto = $1', [id])
            if (recursos && recursos.length > 0) {
                for (const rec of recursos) {
                    let idRecurso = null
                    if (rec.id_recurso) {
                        idRecurso = rec.id_recurso
                    } else if (rec.nuevo) {
                        const { nombre, id_tipo_recurso } = rec.nuevo
                        const recResult = await client.query(
                            'INSERT INTO recurso_tecnico (nombre_equipo, id_tipo_recurso) VALUES ($1, $2) RETURNING id_recurso',
                            [nombre, Number(id_tipo_recurso) || null]
                        )
                        idRecurso = recResult.rows[0].id_recurso
                    }
                    if (idRecurso) {
                        await client.query(
                            'INSERT INTO uso_recurso (id_recurso, id_proyecto, fecha_inicio_uso, fecha_fin_uso) VALUES ($1, $2, $3, $4)',
                            [idRecurso, id, rec.fecha_inicio_uso, rec.fecha_fin_uso]
                        )
                    }
                }
            }

            await client.query('DELETE FROM asignacion_personal WHERE id_proyecto = $1', [id])
            if (personal && personal.length > 0) {
                for (const pers of personal) {
                    let idPersonal = null
                    if (pers.id_personal) {
                        idPersonal = pers.id_personal
                    } else if (pers.nuevo) {
                        const { nombre_personal, cedula, tipo_identificacion, id_rol, salario, email, telefono, prefijo_telefono } = pers.nuevo
                        const persResult = await client.query(
                            `INSERT INTO personal (nombre_personal, cedula_personal, tipo_identificacion, id_rol, salario, email_personal, telefono, prefijo_telefono)
                             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_personal`,
                            [nombre_personal, cedula, tipo_identificacion || 'V', Number(id_rol) || null, Number(salario) || 0, email, telefono, prefijo_telefono || null]
                        )
                        idPersonal = persResult.rows[0].id_personal
                    }
                    if (idPersonal) {
                        const hoy = new Date().toISOString().slice(0, 10)
                        await client.query(
                            'INSERT INTO asignacion_personal (id_proyecto, id_personal, horas_trabajadas, fecha_registro) VALUES ($1, $2, $3, $4)',
                            [id, idPersonal, Number(pers.horas_trabajadas) || 0, hoy]
                        )
                    }
                }
            }

            if (idCliente) {
                const contratoExistente = await client.query('SELECT id_contrato FROM contratos WHERE id_proyecto = $1', [id])
                const fechaFirma = contrato?.fecha_firma || new Date().toISOString().slice(0, 10)
                const desc = contrato?.descripcion_servicios || 'Servicios de producción audiovisual'
                if (contratoExistente.rows.length > 0) {
                    await client.query(
                        `UPDATE contratos SET id_cliente=$1, fecha_firma=$2, monto_contrato=$3, descripcion_servicios=$4
                         WHERE id_proyecto=$5`,
                        [idCliente, fechaFirma, proyecto.presupuesto, desc, id]
                    )
                } else {
                    await client.query(
                        `INSERT INTO contratos (id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [id, idCliente, fechaFirma, proyecto.presupuesto, desc]
                    )
                }
            }

            await client.query('COMMIT')

            const proyectoActualizado = await client.query(
                `SELECT pr.*, tp.nombre_tipo, ep.nombre_estado FROM proyectos pr
                 LEFT JOIN tipos_proyecto tp ON pr.id_tipo_proyecto = tp.id_tipo_proyecto
                 LEFT JOIN estados_proyecto ep ON pr.id_estado_proyecto = ep.id_estado_proyecto
                 WHERE pr.id_proyecto = $1`, [id]
            )

            return {
                message: 'Proyecto actualizado exitosamente con todas sus relaciones',
                proyecto: proyectoActualizado.rows[0]
            }
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    }
}
