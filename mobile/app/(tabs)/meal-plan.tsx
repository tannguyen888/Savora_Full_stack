import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { enUS, ja, ko, vi } from "date-fns/locale";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { savouraClient } from "@/api/savouraClient";
import { design } from "@/lib/design";
import { MealSlotMobile } from "@/components/mealplan/MealSlotMobile";
import { RecipePickerModalMobile } from "@/components/mealplan/RecipePickerModalMobile";
import { MealPlan } from "@/types/domain";
import { useLang } from "@/lib/language";

const MEAL_TYPES: Array<MealPlan["meal_type"]> = ["breakfast", "lunch", "dinner", "snack"];
const MEAL_EMOJIS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎" };
const LOCALES = { en: enUS, vi, ko, ja } as const;

export default function MealPlanScreen() {
  const { t, lang } = useLang();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlot, setPickerSlot] = useState<{ date: Date; mealType: MealPlan["meal_type"] } | null>(null);
  const queryClient = useQueryClient();
  const locale = LOCALES[lang];

  const mealLabels: Record<MealPlan["meal_type"], string> = {
    breakfast: t.mealBreakfast,
    lunch: t.mealLunch,
    dinner: t.mealDinner,
    snack: t.mealSnack
  };

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const startDate = format(weekDays[0], "yyyy-MM-dd");
  const endDate = format(weekDays[6], "yyyy-MM-dd");

  const queryKey = ["mealPlans", startDate, endDate];

  const { data: mealPlans = [] } = useQuery({
    queryKey,
    queryFn: () => savouraClient.entities.MealPlan.filter({ date: { $gte: startDate, $lte: endDate } })
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => savouraClient.entities.Recipe.list()
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<MealPlan>) => savouraClient.entities.MealPlan.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => savouraClient.entities.MealPlan.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey })
  });

  const getMealPlan = (date: Date, mealType: MealPlan["meal_type"]) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return mealPlans.find((mp: MealPlan) => mp.date === dateStr && mp.meal_type === mealType);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: design.color.background }}>
      <View className="px-4 pb-3 pt-2">
        <Text className="text-5xl font-bold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
          {t.mealPlan}
        </Text>
        <Text className="mt-1 text-sm" style={{ color: design.color.mutedForeground }}>
          {t.mealPlanSubtitle}
        </Text>

        <View className="mt-3 flex-row items-center justify-between">
          <Pressable onPress={() => setWeekStart((prev: Date) => addDays(prev, -7))} className="rounded-full border px-3 py-2" style={{ borderColor: design.color.border }}>
            <Text style={{ color: design.color.mutedForeground }}>◀</Text>
          </Pressable>
          <Text className="text-lg font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
            {format(weekDays[0], "MMM d", { locale })} – {format(weekDays[6], "MMM d, yyyy", { locale })}
          </Text>
          <Pressable onPress={() => setWeekStart((prev: Date) => addDays(prev, 7))} className="rounded-full border px-3 py-2" style={{ borderColor: design.color.border }}>
            <Text style={{ color: design.color.mutedForeground }}>▶</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={weekDays}
        keyExtractor={(day) => day.toISOString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110, gap: 12 }}
        renderItem={({ item: day }) => {
          const isToday = isSameDay(day, new Date());
          return (
            <View
              className="rounded-xl border p-3"
              style={{ borderColor: design.color.border, backgroundColor: design.color.card }}
            >
              <Text className="mb-2 text-base font-semibold" style={{ color: isToday ? design.color.primary : design.color.foreground }}>
                {format(day, "EEEE, MMM d", { locale })}
              </Text>

              <View className="gap-2">
                {MEAL_TYPES.map((meal) => {
                  const mp = getMealPlan(day, meal);
                  return (
                    <View key={meal} className="flex-row items-center gap-2">
                      <Text className="w-20 text-xs" style={{ color: design.color.mutedForeground }}>
                        {MEAL_EMOJIS[meal]} {mealLabels[meal]}
                      </Text>
                      <View className="flex-1">
                        <MealSlotMobile
                          mealPlan={mp}
                          onAdd={() => {
                            setPickerSlot({ date: day, mealType: meal });
                            setPickerOpen(true);
                          }}
                          onRemove={(mealPlan) => deleteMutation.mutate(mealPlan.id)}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        }}
      />

      <RecipePickerModalMobile
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        recipes={recipes}
        onSelect={(recipe) => {
          if (!pickerSlot) return;
          createMutation.mutate({
            date: format(pickerSlot.date, "yyyy-MM-dd"),
            meal_type: pickerSlot.mealType,
            recipe_id: recipe.id,
            recipe_name: recipe.name,
            recipe_image: recipe.image_url
          });
        }}
      />
    </SafeAreaView>
  );
}
