import { useState, useMemo } from "react";
import { useLang } from "@/lib/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import MealSlot from "@/components/mealplan/MealSlot";
import RecipePicker from "@/components/mealplan/RecipePicker";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];
// Labels resolved from t inside component
const MEAL_EMOJIS = { breakfast: "🌅", lunch: "☀️", dinner: "🌙", snack: "🍎" };

export default function MealPlan() {
  const { t } = useLang();
  const MEAL_LABELS = { breakfast: t.breakfast, lunch: t.lunch, dinner: t.dinner, snack: t.snack };
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSlot, setPickerSlot] = useState(null);
  const queryClient = useQueryClient();

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const startDate = format(weekDays[0], "yyyy-MM-dd");
  const endDate = format(weekDays[6], "yyyy-MM-dd");
  const queryKey = ["mealPlans", startDate, endDate];

  const { data: mealPlans = [] } = useQuery({
    queryKey,
    queryFn: () => base44.entities.MealPlan.filter({
      date: { $gte: startDate, $lte: endDate }
    }),
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ["recipes"],
    queryFn: () => base44.entities.Recipe.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MealPlan.create(data),
    // Optimistic update
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      const optimistic = { ...newEntry, id: `optimistic-${Date.now()}` };
      queryClient.setQueryData(queryKey, (old = []) => [...old, optimistic]);
      return { previous };
    },
    onError: (_, __, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.MealPlan.delete(id),
    // Optimistic update
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old = []) => old.filter(mp => mp.id !== id));
      return { previous };
    },
    onError: (_, __, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const getMealPlan = (date, mealType) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return mealPlans.find(mp => mp.date === dateStr && mp.meal_type === mealType);
  };

  const handleAddMeal = (date, mealType) => {
    setPickerSlot({ date, mealType });
    setPickerOpen(true);
  };

  const handleSelectRecipe = (recipe) => {
    if (!pickerSlot) return;
    createMutation.mutate({
      date: format(pickerSlot.date, "yyyy-MM-dd"),
      meal_type: pickerSlot.mealType,
      recipe_id: recipe.id,
      recipe_name: recipe.name,
      recipe_image: recipe.image_url || "",
    });
  };

  const handleRemoveMeal = (mealPlan) => {
    deleteMutation.mutate(mealPlan.id);
  };

  const goToPreviousWeek = () => setWeekStart(prev => addDays(prev, -7));
  const goToNextWeek = () => setWeekStart(prev => addDays(prev, 7));
  const goToCurrentWeek = () => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const isCurrentWeek = isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <div className="space-y-6" style={{ overscrollBehavior: "none" }}>
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight">
          {t.mealPlan}
        </h1>
        <p className="text-muted-foreground mt-1.5">
          {t.planYourMeals}
        </p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={goToPreviousWeek} className="no-select">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1 text-center">
          <p className="font-heading font-semibold text-base sm:text-lg">
            {format(weekDays[0], "MMM d")} – {format(weekDays[6], "MMM d, yyyy")}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={goToNextWeek} className="no-select">
          <ChevronRight className="w-4 h-4" />
        </Button>
        {!isCurrentWeek && (
          <Button variant="outline" size="sm" onClick={goToCurrentWeek} className="gap-2 no-select">
            <CalendarDays className="w-4 h-4" /> {t.today}
          </Button>
        )}
      </div>

      {/* Desktop Grid */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="grid grid-cols-8 gap-0 border border-border/60 rounded-xl overflow-hidden bg-card min-w-[900px]">
          <div className="p-3 bg-muted/50 border-b border-r border-border/40" />
          {weekDays.map((day) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toISOString()} className={`p-3 text-center border-b border-r border-border/40 last:border-r-0 ${isToday ? "bg-primary/5" : "bg-muted/50"}`}>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{format(day, "EEE")}</p>
                <p className={`text-lg font-semibold mt-0.5 ${isToday ? "text-primary" : ""}`}>{format(day, "d")}</p>
              </div>
            );
          })}
          {MEAL_TYPES.map((meal) => (
            <>
              <div key={`label-${meal}`} className="p-3 border-r border-b border-border/40 last:border-b-0 flex items-center gap-2 bg-muted/30">
                <span className="text-sm">{MEAL_EMOJIS[meal]}</span>
                <span className="text-sm font-medium capitalize">{MEAL_LABELS[meal]}</span>
              </div>
              {weekDays.map((day) => {
                const mp = getMealPlan(day, meal);
                return (
                  <div key={`${day.toISOString()}-${meal}`} className="p-2 border-r border-b border-border/40 last:border-r-0 last:border-b-0 min-h-[72px]">
                    <MealSlot mealPlan={mp} onAdd={() => handleAddMeal(day, meal)} onRemove={handleRemoveMeal} />
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {weekDays.map((day) => {
          const isToday = isSameDay(day, new Date());
          return (
            <Card key={day.toISOString()} className={`border-border/50 ${isToday ? "ring-2 ring-primary/20" : ""}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  {isToday && <div className="w-2 h-2 rounded-full bg-primary" />}
                  <span className="font-heading">{format(day, "EEEE, MMM d")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {MEAL_TYPES.map((meal) => {
                  const mp = getMealPlan(day, meal);
                  return (
                    <div key={meal} className="flex items-center gap-3">
                      <span className="text-xs w-20 text-muted-foreground capitalize shrink-0 no-select">
                        {MEAL_EMOJIS[meal]} {MEAL_LABELS[meal]}
                      </span>
                      <div className="flex-1">
                        <MealSlot mealPlan={mp} onAdd={() => handleAddMeal(day, meal)} onRemove={handleRemoveMeal} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <RecipePicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        recipes={recipes}
        onSelect={handleSelectRecipe}
      />
    </div>
  );
}