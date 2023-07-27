import { Button, Checkbox, Heading, MultiStep, Text, TextInput } from "@ignite-ui/react";
import { Container, Header } from "../styles";
import { FormError, IntervalBox, IntervalConteiner, IntervalDay, IntervalInputs, IntervalItem } from "./styles";
import { ArrowRight } from "phosphor-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { getWeekDays } from "@/utils/get-week-days";
import { zodResolver } from "@hookform/resolvers/zod";
import { convertTimeToMinutes } from "@/utils/convert-time-to-minutes";
import { api } from "@/lib/axios";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";

const timeIntervalsForSchema = z.object({
    intervals: z.array(
        z.object({
            weekDay: z.number().min(0).max(6),
            enabled: z.boolean(),
            startTime: z.string(),
            endTime: z.string(),
        })
    ).length(7)
    .transform(intervals => intervals.filter(intervals => intervals.enabled))
    .refine(intervals => intervals.length > 0, {
        message: 'Você precisa selecionar pelo menos um dia da semana!'
    })
    .transform(intervals => (
        intervals.map(interval => {
            return {
                weekDay: interval.weekDay,
                startTimeInMinutes: convertTimeToMinutes(interval.startTime),
                endTimeInMinutes: convertTimeToMinutes(interval.endTime),
            }
        })
    ))
    .refine(intervals => (
        intervals.every(interval => interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes)
    ), {
        message: 'O horário de término deve ser pelo menos 1h distante do início.'
    })
})

type TimeIntervalsFormInput = z.input<typeof timeIntervalsForSchema>
type timeIntervalsFormOutput = z.output<typeof timeIntervalsForSchema>

export default function TimeIntervals() {
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: {
            isSubmitting,
            errors,
        }
    } = useForm<TimeIntervalsFormInput>({
        resolver: zodResolver(timeIntervalsForSchema),
        defaultValues: {
            intervals: [
                { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
                { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
                { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
                { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
                { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
                { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
                { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
            ]
        }
    })
    
    const router = useRouter()

    const { fields } = useFieldArray({
        control,
        name: 'intervals'
    })

    const intervals = watch('intervals')

    const weekDays = getWeekDays()

    async function handleSetTimeIntervals(data: any) {
        const { intervals } = data as TimeIntervalsFormInput
        await api.post('/users/time-intervals', { intervals })
        await router.push('/register/update-profile')
    }

    return (
        <>
            <NextSeo title="Selecione sua disponibilidade | Ignite Call" noindex />
            <Container>
                <Header>
                    <Heading as="strong">Quase lá</Heading>
                    <Text>
                        Defina o intervalo de horários que você está disponível em casa dia
                        da semana.
                    </Text>

                    <MultiStep size={4} currentStep={3} />
                </Header>
                
                <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
                    <IntervalConteiner>
                    {fields.map((field, index) => (
                            <IntervalItem key={field.id}>
                                <IntervalDay>
                                    <Controller
                                        name={`intervals.${index}.enabled`}
                                        control={control}
                                        render={({ field }) => (
                                            <Checkbox 
                                                onCheckedChange={(checked) => {
                                                    field.onChange(checked === true)
                                                }}
                                                checked={field.value}
                                            />
                                        )}
                                    />
                                    
                                    <Text>{weekDays[field.weekDay]}</Text>
                                </IntervalDay>
                                <IntervalInputs>
                                    <TextInput 
                                        size="sm"
                                        type="time"
                                        step={60}
                                        {...register(`intervals.${index}.startTime`)}
                                        disabled={intervals[index].enabled === false}
                                    />
                                    <TextInput 
                                        size="sm"
                                        type="time"
                                        step={60}
                                        {...register(`intervals.${index}.endTime`)}
                                        disabled={intervals[index].enabled === false}
                                    />
                                </IntervalInputs>
                            </IntervalItem>
                    ))}
                    </IntervalConteiner>

                    {errors.intervals && (
                        <FormError size="sm">
                            {errors.intervals.message}
                        </FormError>
                    )}

                    <Button type="submit" disabled={isSubmitting}>
                        Próximo passo
                        <ArrowRight />
                    </Button>

                </IntervalBox>
            </Container>
        </>
    )
}