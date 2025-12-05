import { zodResolver } from "@hookform/resolvers/zod";
import { MotiView, useAnimationState } from "moti";
import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Image, Keyboard, TextInput, View } from "react-native";
import { z } from "zod";

import { KeyboardWrapper } from "@/src/components/keyboard-wrapper";
import { Button } from "@/src/components/ui/button";
import { FormField } from "@/src/components/ui/form-field";
import { Input } from "@/src/components/ui/input";
import { SecureInput } from "@/src/components/ui/secure-input";
import { Typography } from "@/src/components/ui/typography";
import { useSignIn } from "@/src/http/generated/auth/auth";
import { maskCpf } from "@/src/utils/masks";
import { useRouter } from "expo-router";

const signInSchema = z.object({
  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .transform((val) => val.replace(/\D/g, ""))
    .refine((val) => /^\d{11}$/.test(val), "CPF inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn() {
  const { mutateAsync: signIn } = useSignIn();
  const passwordRef = useRef<TextInput>(null);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { cpf: "", password: "" },
  });

  const onSubmit = async (data: SignInFormData) => {
    await signIn({
      data: {
        document: data.cpf,
        password: data.password,
      },
    });
    router.replace("/protected/onboarding");
  };

  // --------------------------------------
  // 🔥 Framer Motion (Moti) Animation State
  // --------------------------------------
  const logoAnimation = useAnimationState({
    closed: { translateY: 0, scale: 1, opacity: 1 },
    open: { translateY: -60, scale: 0.85, opacity: 0.9 },
  });

  useEffect(() => {
    const subShow = Keyboard.addListener("keyboardWillShow", () =>
      logoAnimation.transitionTo("open")
    );
    const subHide = Keyboard.addListener("keyboardWillHide", () =>
      logoAnimation.transitionTo("closed")
    );

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  return (
    <KeyboardWrapper className="flex-1" keyboardOffset={30}>
      <View className="flex-1 justify-center items-center px-4">
        {/* 🔥 LOGO COM ANIMAÇÃO FRAMER MOTION */}
        <MotiView
          state={logoAnimation}
          transition={{ type: "timing", duration: 250 }}
          style={{
            position: "absolute",
            top: 160,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Image
            source={require("@/assets/images/splash-icon.png")}
            style={{ width: 240, height: 120 }}
            resizeMode="contain"
          />
        </MotiView>

        {/* 🔥 CARD DO FORM */}
        <View className="w-full bg-white p-6 gap-4 rounded-xl border border-input mt-10">
          <View className="gap-1 mb-2">
            <Typography variant="title" align="center">
              Gestão de Ambulâncias
            </Typography>
            <Typography variant="subtitle" align="center">
              Acesse sua conta com CPF
            </Typography>
          </View>

          <View className="w-full">
            <FormField control={control} name="cpf" error={errors.cpf}>
              {({ value, onChange, onBlur }) => (
                <Input
                  value={value}
                  onChangeText={(text) => onChange(maskCpf(text))}
                  onBlur={onBlur}
                  placeholder="Insira seu CPF"
                  keyboardType="numeric"
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  variant={errors.cpf ? "error" : "default"}
                />
              )}
            </FormField>

            <FormField
              control={control}
              name="password"
              error={errors.password}
            >
              {({ value, onChange, onBlur }) => (
                <SecureInput
                  ref={passwordRef}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Senha"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  variant={errors.password ? "error" : "default"}
                  keyboardType="numeric"
                />
              )}
            </FormField>
          </View>

          <Button
            title={isSubmitting ? "Entrando..." : "Entrar"}
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            className="mt-2"
          />

          <Typography variant="small" align="center" className="mt-4">
            © {new Date().getFullYear()} — Connect - Gestão de Ambulâncias
          </Typography>
        </View>
      </View>
    </KeyboardWrapper>
  );
}
