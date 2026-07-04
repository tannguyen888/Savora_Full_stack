import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { design } from "@/lib/design";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
};

const CATEGORIES = ["all", "breakfast", "lunch", "dinner", "snack", "dessert", "drink"];

export function RecipeFiltersMobile({ search, onSearchChange, category, onCategoryChange }: Props) {
  return (
    <View className="gap-3">
      <TextInput
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search recipe name or description"
        className="rounded-xl border px-3 py-2.5 text-sm"
        style={{
          borderColor: design.color.border,
          backgroundColor: design.color.card,
          color: design.color.foreground
        }}
        placeholderTextColor={design.color.mutedForeground}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-2">
          {CATEGORIES.map((item) => {
            const active = item === category;
            return (
              <Pressable
                key={item}
                onPress={() => onCategoryChange(item)}
                className="rounded-full border px-3 py-1.5"
                style={{
                  backgroundColor: active ? design.color.primary : design.color.card,
                  borderColor: active ? design.color.primary : design.color.border
                }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ color: active ? "#ffffff" : design.color.mutedForeground }}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
