import { FlatList, Modal, Pressable, Text, View } from "react-native";
import { Recipe } from "@/types/domain";
import { design } from "@/lib/design";

type Props = {
  open: boolean;
  onClose: () => void;
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
};

export function RecipePickerModalMobile({ open, onClose, recipes, onSelect }: Props) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/30" onPress={onClose}>
        <Pressable
          className="max-h-[70%] rounded-t-3xl p-4"
          style={{ backgroundColor: design.color.card }}
          onPress={() => null}
        >
          <Text className="mb-3 text-lg font-semibold" style={{ color: design.color.foreground, fontFamily: design.font.heading }}>
            Choose a Recipe
          </Text>
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                className="rounded-xl border px-3 py-3"
                style={{ borderColor: design.color.border }}
              >
                <Text className="text-sm font-semibold" style={{ color: design.color.foreground }}>
                  {item.name}
                </Text>
                {!!item.description && (
                  <Text className="mt-1 text-xs" style={{ color: design.color.mutedForeground }} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
              </Pressable>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
