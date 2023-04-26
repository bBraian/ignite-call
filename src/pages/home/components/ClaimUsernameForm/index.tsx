import { Button, Text, TextInput } from "@ignite-ui/react";
import { Form, FormAnnotation } from "./styles";
import { ArrowRight } from "phosphor-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const claimUsernameFormSchema = z.object({
    username: z.string()
    .min(3, { message: 'Usuário deve ter mais de 3 caracteres.' })
    .regex(/^([a-z\\\\-]+)$/i, { message: 'Usuário deve ter apenas letras e hifens.' })
    .transform(username => username.toLowerCase())
})

type ClaimUsernameFormData = z.infer<typeof claimUsernameFormSchema>

export function ClaimUsernameForm() {
type ClaimUsernameFormData = z.infer<typeof claimUsernameFormSchema>
    const { register, handleSubmit, formState: { errors } } = useForm<ClaimUsernameFormData>({
        resolver: zodResolver(claimUsernameFormSchema)
    });

    async function handleClaimUsername(data: ClaimUsernameFormData) {
        console.log(data);
    }

    return (
        <>
            <Form as="form" onSubmit={handleSubmit(handleClaimUsername)}>
                <TextInput 
                    size="sm" 
                    prefix="ignite.com/" 
                    placeholder="seu-usuario"
                    {...register('username')}
                />
                <Button size="sm" type="submit">
                    Reservar usuário
                    <ArrowRight />
                </Button>
            </Form>
            <FormAnnotation>
                <Text size="sm" style={{color: errors.username ? '#ff5d5d' : '#a9a9b2'}}>
                    {errors.username ? errors.username.message : 'Digite o nome do usuário desejado'}
                </Text>
            </FormAnnotation>
        </>
       
    )
}