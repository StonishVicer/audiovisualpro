import { pool } from '../config/database.js'

export const createProyectoCompleto = async (req, res) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const { proyecto, cliente, locaciones, recursos, personal, contrato } = req.body

        if (!proyecto || !proyecto.nombre || proyecto.id_tipo == null || proyecto.id_estado == null) {
            return res.status(400).json({ message: 'Faltan campos obligatorios del proyecto' })
        }

        const presupuesto = Number(proyecto.presupuesto) || 0
        const idTipo = Number(proyecto.id_tipo)
        const idEstado = Number(proyecto.id_estado)

        const proyectoResult = await client.query(
            `INSERT INTO proyectos (nombre_proyecto, id_tipo_proyecto, id_estado_proyecto, fecha_inicio, fecha_fin_estimada, presupuesto)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [proyecto.nombre, idTipo, idEstado, proyecto.fecha_inicio, proyecto.fecha_fin_estimada, presupuesto]
        )
        // INSERT INTO proyectos section above
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

        // CREATE resources
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

        // CREATE personal block
        if (personal && personal.length > 0) {
            for (const pers of personal) {
                let idPersonal = null
                if (pers.id_personal) {
                    idPersonal = pers.id_personal
                } else if (pers.nuevo) {
                    const { nombre_personal, cedula, id_rol, salario, email, telefono } = pers.nuevo
                    const persResult = await client.query(
                        `INSERT INTO personal (nombre_personal, cedula_personal, id_rol, salario, email_personal, telefono)
                         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_personal`,
                        [nombre_personal, cedula, Number(id_rol) || null, Number(salario) || 0, email, telefono]
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

        // CREATE contrato
        if (contrato && idCliente) {
            const fechaFirma = contrato.fecha_firma || new Date().toISOString().slice(0, 10)
            await client.query(
                `INSERT INTO contratos (id_proyecto, id_cliente, fecha_firma, monto_contrato, descripcion_servicios)
                 VALUES ($1, $2, $3, $4, $5)`,
                [idProyecto, idCliente, fechaFirma, proyecto.presupuesto, contrato.descripcion_servicios || 'Servicios de producción audiovisual']
            )
        }

        await client.query('COMMIT')

        res.status(201).json({
            message: 'Proyecto creado exitosamente con todas sus relaciones',
            id_proyecto: idProyecto,
            proyecto: proyectoResult.rows[0]
        })
    } catch (err) {
        await client.query('ROLLBACK')
        console.error('Error al crear proyecto completo:', err)
        res.status(500).json({ message: 'Error al crear el proyecto completo', error: err.message })
    } finally {
        client.release()
    }
}

export const updateProyectoCompleto = async (req, res) => {
    const { id } = req.params
    const client = await pool.connect()
    try {
        await client.query('BEGIN')

        const { proyecto, cliente, locaciones, recursos, personal, contrato } = req.body

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

        // UPDATE resources section
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

        // UPDATE personal
        await client.query('DELETE FROM asignacion_personal WHERE id_proyecto = $1', [id])
        if (personal && personal.length > 0) {
            for (const pers of personal) {
                let idPersonal = null
                if (pers.id_personal) {
                    idPersonal = pers.id_personal
                } else if (pers.nuevo) {
                    const { nombre_personal, cedula, id_rol, salario, email, telefono } = pers.nuevo
                    const persResult = await client.query(
                        `INSERT INTO personal (nombre_personal, cedula_personal, id_rol, salario, email_personal, telefono)
                         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_personal`,
                        [nombre_personal, cedula, Number(id_rol) || null, Number(salario) || 0, email, telefono]
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
            const fechaFirma = contrato.fecha_firma || new Date().toISOString().slice(0, 10)
            const desc = contrato.descripcion_servicios || 'Servicios de produccion audiovisual'
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

        res.json({
            message: 'Proyecto actualizado exitosamente con todas sus relaciones',
            proyecto: proyectoActualizado.rows[0]
        })
    } catch (err) {
        await client.query('ROLLBACK')
        console.error('Error al actualizar proyecto completo:', err)
        res.status(500).json({ message: 'Error al actualizar el proyecto completo', error: err.message })
    } finally {
        client.release()
    }
}
