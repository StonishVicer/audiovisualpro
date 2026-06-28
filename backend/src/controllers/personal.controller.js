import { PersonalService } from '../services/personalService.js'

export const getPersonalById = async (req, res, next) => {
    try {
        const personal = await PersonalService.findById(req.params.id)
        res.json(personal)
    } catch (err) {
        next(err)
    }
}

export const getPersonal = async (req, res, next) => {
    try {
        const personal = await PersonalService.findAll()
        res.json(personal)
    } catch (err) {
        next(err)
    }
}

export const createPersonal = async (req, res, next) => {
    try {
        const personal = await PersonalService.create(req.body)
        res.status(201).json(personal)
    } catch (err) {
        next(err)
    }
}

export const deletePersonal = async (req, res, next) => {
    try {
        const result = await PersonalService.remove(req.params.id)
        res.json(result)
    } catch (err) {
        next(err)
    }
}

export const updatePersonal = async (req, res, next) => {
    try {
        const personal = await PersonalService.update(req.params.id, req.body)
        res.json(personal)
    } catch (err) {
        next(err)
    }
}
