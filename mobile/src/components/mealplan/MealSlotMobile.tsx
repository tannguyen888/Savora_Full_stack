import { Pressable, Text, View } from "react-native";
import { MealPlan } from "@/types/domain";
import { design } from "@/lib/design";
import { useLang } from "@/lib/language";

type Props = {
  mealPlan?: MealPlan;
  onAdd: () => void;
  onRemove: (mealPlan: MealPlan) => void;
};

export function MealSlotMobile({ mealPlan, onAdd, onRemove }: Props) {
  const { t } = useLang();

  if (!mealPlan) {
    return (
      <Pressable
        onPress={onAdd}
        className="rounded-xl border border-dashed px-3 py-2.5"
        style={{ borderColor: design.color.border }}
      >
        <Text className="text-center text-sm font-semibold" style={{ color: design.color.mutedForeground }}>
          + {t.add}
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      className="rounded-xl border px-3 py-2.5"
      style={{ borderColor: design.color.border, backgroundColor: design.color.card }}
    >
      <Text className="text-sm font-semibold" style={{ color: design.color.foreground }} numberOfLines={1}>
        {mealPlan.recipe_name}
      </Text>
      <Pressable onPress={() => onRemove(mealPlan)} className="mt-1">
        <Text className="text-xs" style={{ color: "#ef4444" }}>
          {t.remove}
        </Text>
      </Pressable>
    </View>
  );
}
