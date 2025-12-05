import { useRef } from "react";
import { Animated } from "react-native";

export default function useConfirmationAnimationsHook() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(
    Array(3)
      .fill(0)
      .map(() => new Animated.Value(0))
  ).current;

  const animateEntrance = () => {
    Animated.stagger(
      80,
      cardAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        })
      )
    ).start();
  };

  const returnObject = {
    animateEntrance,
    scaleAnim,
    fadeAnim,
    cardAnims,
    progressAnim,
  } as const; // <- 🔥 mantém os tipos estáveis, inferidos e imutáveis

  return returnObject;
}

export type UseConfirmationAnimationHookReturn = ReturnType<
  typeof useConfirmationAnimationsHook
>;
