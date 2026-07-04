import { createContext, PropsWithChildren, useContext, useMemo, useState } from "react";
import { Platform } from "react-native";

const LANGUAGES = {
  en: { code: "en", label: "English", flag: "US" },
  ko: { code: "ko", label: "한국어", flag: "KR" },
  ja: { code: "ja", label: "日本語", flag: "JP" },
  vi: { code: "vi", label: "Tiếng Việt", flag: "VN" }
} as const;

type LangCode = keyof typeof LANGUAGES;

const DICT = {
  en: {
    recipes: "Recipes",
    mealPlan: "Meal Plan",
    community: "Chef Hub",
    settings: "Settings",
    addRecipe: "Add Recipe",
    myRecipes: "My Recipes",
    recipeInCollection: (n: number) => `${n} recipes in your collection`,
    settingsSubtitle: "Manage account and preferences",
    languageSection: "Language",
    accountSection: "Account",
    themeSection: "Appearance",
    darkMode: "Dark mode",
    darkModeOn: "On",
    darkModeOff: "Off",
    noEmail: "No email",
    logout: "Log out",
    communitySubtitle: "Share recipes, ideas and connect with everyone",
    noPostsYet: "No posts yet",
    beFirstToShare: "Be the first one to share",
    sharePlaceholder: "Share something with the community...",
    attachRecipe: "Attach recipe",
    chooseRecipeToAttach: "Choose a recipe to attach",
    close: "Close",
    posting: "Posting",
    post: "Post",
    likeLabel: (n: number) => `♡ ${n} likes`,
    comment: "Comment",
    shareLabel: (n: number) => `Share (${n})`,
    saveToRecipes: "Save to your recipes",
    saving: "Saving...",
    savedTitle: "Saved",
    savedMessage: "Recipe has been added to your collection.",
    saveFailedTitle: "Save failed",
    saveFailedMessage: "Could not save recipe from this post.",
    loadingComments: "Loading comments...",
    writeComment: "Write a comment...",
    postComment: "Post Comment",
    communityRecipeNameFallback: "Saved Recipe",
    fromCommunityTag: "from community"
    ,
    mealPlanSubtitle: "Plan your meals for the week",
    mealBreakfast: "Breakfast",
    mealLunch: "Lunch",
    mealDinner: "Dinner",
    mealSnack: "Snack",
    add: "Add",
    remove: "Remove"
  },
  vi: {
    recipes: "Công Thức",
    mealPlan: "Kế Hoạch Ăn",
    community: "Chef Hub",
    settings: "Cài Đặt",
    addRecipe: "Thêm Công Thức",
    myRecipes: "Công Thức Của Tôi",
    recipeInCollection: (n: number) => `${n} công thức trong bộ sưu tập`,
    settingsSubtitle: "Quản lý tài khoản và tùy chọn",
    languageSection: "Ngôn ngữ",
    accountSection: "Tài Khoản",
    themeSection: "Giao diện",
    darkMode: "Chế độ tối",
    darkModeOn: "Bật",
    darkModeOff: "Tắt",
    noEmail: "Không có email",
    logout: "Đăng xuất",
    communitySubtitle: "Chia sẻ công thức, ý tưởng và kết nối với mọi người",
    noPostsYet: "Chưa có bài viết",
    beFirstToShare: "Hãy là người đầu tiên chia sẻ",
    sharePlaceholder: "Chia sẻ điều gì đó với cộng đồng...",
    attachRecipe: "Đính kèm công thức",
    chooseRecipeToAttach: "Chọn công thức để đính kèm",
    close: "Đóng",
    posting: "Đang đăng",
    post: "Đăng",
    likeLabel: (n: number) => `♡ ${n} Lượt thích`,
    comment: "Bình luận",
    shareLabel: (n: number) => `Chia sẻ (${n})`,
    saveToRecipes: "Lưu vào công thức của bạn",
    saving: "Đang lưu...",
    savedTitle: "Đã lưu",
    savedMessage: "Công thức đã được thêm vào bộ sưu tập của bạn.",
    saveFailedTitle: "Lưu thất bại",
    saveFailedMessage: "Không thể lưu công thức từ bài viết này.",
    loadingComments: "Đang tải bình luận...",
    writeComment: "Viết bình luận...",
    postComment: "Đăng bình luận",
    communityRecipeNameFallback: "Công thức đã lưu",
    fromCommunityTag: "từ cộng đồng"
    ,
    mealPlanSubtitle: "Lên kế hoạch bữa ăn cho tuần tới",
    mealBreakfast: "Sáng",
    mealLunch: "Trưa",
    mealDinner: "Tối",
    mealSnack: "Ăn Vặt",
    add: "Thêm",
    remove: "Xóa"
  },
  ko: {
    recipes: "레시피",
    mealPlan: "식단 계획",
    community: "셰프허브",
    settings: "설정",
    addRecipe: "레시피 추가",
    myRecipes: "내 레시피",
    recipeInCollection: (n: number) => `컬렉션에 ${n}개 레시피`,
    settingsSubtitle: "계정과 환경설정을 관리하세요",
    languageSection: "언어",
    accountSection: "계정",
    themeSection: "화면",
    darkMode: "다크 모드",
    darkModeOn: "켜짐",
    darkModeOff: "꺼짐",
    noEmail: "이메일 없음",
    logout: "로그아웃",
    communitySubtitle: "레시피와 아이디어를 공유하고 모두와 연결하세요",
    noPostsYet: "게시물이 없습니다",
    beFirstToShare: "첫 게시물을 작성해보세요",
    sharePlaceholder: "커뮤니티에 무언가를 공유해보세요...",
    attachRecipe: "레시피 첨부",
    chooseRecipeToAttach: "첨부할 레시피 선택",
    close: "닫기",
    posting: "게시 중",
    post: "게시",
    likeLabel: (n: number) => `♡ 좋아요 ${n}`,
    comment: "댓글",
    shareLabel: (n: number) => `공유 (${n})`,
    saveToRecipes: "내 레시피에 저장",
    saving: "저장 중...",
    savedTitle: "저장 완료",
    savedMessage: "레시피가 내 컬렉션에 저장되었습니다.",
    saveFailedTitle: "저장 실패",
    saveFailedMessage: "이 게시물에서 레시피를 저장할 수 없습니다.",
    loadingComments: "댓글 불러오는 중...",
    writeComment: "댓글을 작성하세요...",
    postComment: "댓글 등록",
    communityRecipeNameFallback: "저장된 레시피",
    fromCommunityTag: "커뮤니티"
    ,
    mealPlanSubtitle: "한 주 식단을 계획하세요",
    mealBreakfast: "아침",
    mealLunch: "점심",
    mealDinner: "저녁",
    mealSnack: "간식",
    add: "추가",
    remove: "삭제"
  },
  ja: {
    recipes: "レシピ",
    mealPlan: "食事計画",
    community: "シェフハブ",
    settings: "設定",
    addRecipe: "レシピ追加",
    myRecipes: "マイレシピ",
    recipeInCollection: (n: number) => `コレクションに${n}件`,
    settingsSubtitle: "アカウントと設定を管理",
    languageSection: "言語",
    accountSection: "アカウント",
    themeSection: "表示",
    darkMode: "ダークモード",
    darkModeOn: "オン",
    darkModeOff: "オフ",
    noEmail: "メールなし",
    logout: "ログアウト",
    communitySubtitle: "レシピやアイデアを共有してみんなとつながろう",
    noPostsYet: "投稿がありません",
    beFirstToShare: "最初の投稿をしてみましょう",
    sharePlaceholder: "コミュニティに投稿してみましょう...",
    attachRecipe: "レシピ添付",
    chooseRecipeToAttach: "添付するレシピを選択",
    close: "閉じる",
    posting: "投稿中",
    post: "投稿",
    likeLabel: (n: number) => `♡ いいね ${n}`,
    comment: "コメント",
    shareLabel: (n: number) => `共有 (${n})`,
    saveToRecipes: "自分のレシピに保存",
    saving: "保存中...",
    savedTitle: "保存しました",
    savedMessage: "レシピをコレクションに追加しました。",
    saveFailedTitle: "保存に失敗しました",
    saveFailedMessage: "この投稿からレシピを保存できません。",
    loadingComments: "コメントを読み込み中...",
    writeComment: "コメントを書く...",
    postComment: "コメント投稿",
    communityRecipeNameFallback: "保存したレシピ",
    fromCommunityTag: "コミュニティ"
    ,
    mealPlanSubtitle: "1週間の食事を計画しましょう",
    mealBreakfast: "朝",
    mealLunch: "昼",
    mealDinner: "夜",
    mealSnack: "間食",
    add: "追加",
    remove: "削除"
  }
};

type LanguageContextType = {
  lang: LangCode;
  switchLang: (code: LangCode) => void;
  t: (typeof DICT)[LangCode];
  LANGUAGES: typeof LANGUAGES;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

function getInitialLanguage(): LangCode {
  if (Platform.OS !== "web") return "vi";
  const fromStorage = globalThis.localStorage?.getItem("savora_lang") as LangCode | null;
  if (fromStorage && LANGUAGES[fromStorage]) return fromStorage;
  return "vi";
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [lang, setLang] = useState<LangCode>(getInitialLanguage);

  const value = useMemo<LanguageContextType>(() => {
    return {
      lang,
      switchLang: (code) => {
        setLang(code);
        if (Platform.OS === "web") {
          globalThis.localStorage?.setItem("savora_lang", code);
        }
      },
      t: DICT[lang],
      LANGUAGES
    };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
