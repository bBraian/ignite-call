import { prisma } from "@/lib/prisma";
import { z } from 'zod'
import { NextApiRequest, NextApiResponse } from "next";
import dayjs from "dayjs";

export default async function handle(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if(req.method !== 'POST') {
        return res.status(405).end()
    }

    const username = String(req.query.username)

    const user = await prisma.user.findUnique({
        where: {
            username
        }
    })

    if(!user) {
        return res.status(400).json({ message: 'User does not exist' })
    }

    const createSchedulingBodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
        observations: z.string(),
        date: z.string().datetime()
    })

    const { name, email, observations, date } = createSchedulingBodySchema.parse(req.body)

    const schedulingDate = dayjs(date).startOf('hour')

    if(schedulingDate.isBefore(new Date())) {
        return res.status(400).json({ message: 'Não é possível fazer um agendamento no passado!' })
    }

    const conflictingScheduling = await prisma.scheduling.findFirst({
        where: {
            user_id: user.id,
            date: schedulingDate.toDate()
        }
    })

    if(conflictingScheduling) {
        return res.status(400).json({ message: 'Já existe um agendamento nesse horário' })
    }

    await prisma.scheduling.create({
        data: {
            date: schedulingDate.toDate(),
            name,
            email,
            observations,
            user_id: user.id
        }
    })
    
    return res.status(201).end()
}