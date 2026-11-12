import { useCallback, useState } from "react";
import { AchievementsCard } from "../components/profile/AchievementsCard";
import { CareerProgressCard, SettingsCard } from "../components/profile/CareerProgressCard";
import { EditProfileModal, type EditTab } from "../components/profile/EditProfileModal";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { StatsCard } from "../components/profile/StatsCard";
import { useProfile } from "../context/ProfileContext";
import type { Theme } from "../hooks/useTheme";
import "../styles/profile.css";

type ProfilePageProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function ProfilePage({ theme, onToggleTheme }: ProfilePageProps) {
  const { profile, loading, error } = useProfile();
  // Какая вкладка окна редактирования открыта; null — окно закрыто
  const [editTab, setEditTab] = useState<EditTab | null>(null);
  const closeEditor = useCallback(() => setEditTab(null), []);

  if (!profile) {
    return (
      <main className="page">
        <div className="card page-state">{error ? `Не удалось загрузить профиль: ${error}` : loading ? "Загружаю профиль…" : ""}</div>
      </main>
    );
  }

  return (
    <main className="page">
      <ProfileHeader onEdit={setEditTab} />

      {/* Данные анкеты (личное, учёба, навыки, опыт, достижения) не дублируем карточками —
          они в окне «Редактировать профиль». Здесь только сводка, посчитанная из профиля: статистика, значки, готовность к подбору */}
      <div className="profile-grid">
        <div className="profile-col">
          <StatsCard />
          <AchievementsCard />
        </div>

        <div className="profile-col">
          <CareerProgressCard />
          <SettingsCard theme={theme} onToggleTheme={onToggleTheme} />
        </div>
      </div>

      {editTab && <EditProfileModal initialTab={editTab} onClose={closeEditor} />}
    </main>
  );
}
