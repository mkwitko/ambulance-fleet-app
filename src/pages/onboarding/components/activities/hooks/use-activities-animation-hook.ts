import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export default function useActivitiesAnimationsHook({
  shiftModalVisible,
  contactModalVisible,
  driverModalVisible,
  statusModalVisible,
}: {
  shiftModalVisible: boolean;
  contactModalVisible: boolean;
  driverModalVisible: boolean;
  statusModalVisible: boolean;
}) {
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

  const animateProgress = (progress: number) => {
    Animated.spring(progressAnim, {
      toValue: progress,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  };

  useEffect(() => {
    if (
      shiftModalVisible ||
      contactModalVisible ||
      driverModalVisible ||
      statusModalVisible
    ) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [
    shiftModalVisible,
    contactModalVisible,
    driverModalVisible,
    statusModalVisible,
  ]);

  const returnObject = {
    animateEntrance,
    animateProgress,
    scaleAnim,
    fadeAnim,
    cardAnims,
    progressAnim,
  } as const; // <- 🔥 mantém os tipos estáveis, inferidos e imutáveis

  return returnObject;
}

export type UseActivitiesAnimationHookReturn = ReturnType<
  typeof useActivitiesAnimationsHook
>;
