import { useCallback, useState } from "react";
import { AchievementsCard, ProgressBanner } from "../components/profile/AchievementsCard";
import { CareerProgressCard, SettingsCard } from "../components/profile/CareerProgressCard";
import { EditProfileModal, type EditTab } from "../components/profile/EditProfileModal";
import { EducationCard, PersonalCard, PreferencesCard } from "../components/profile/PersonalCard";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { ExperienceCard, SkillsCard } from "../components/profile/SkillsCard";
import { StatsCard } from "../components/profile/StatsCard";
import type { Theme } from "../hooks/useTheme";
import "../styles/profile.css";

type ProfilePageProps = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function ProfilePage({ theme, onToggleTheme }: ProfilePageProps) {
  // Какая вкладка окна редактирования открыта; null — окно закрыто
  const [editTab, setEditTab] = useState<EditTab | null>(null);
  const closeEditor = useCallback(() => setEditTab(null), []);

  return (
    <main className="page">
      <ProfileHeader onEdit={setEditTab} />

      {/* Три колонки: личность и данные · навыки и достижения · прогресс и статистика */}
      <div className="profile-grid">
        <div className="profile-col">
          <PersonalCard onEdit={setEditTab} />
          <EducationCard onEdit={setEditTab} />
          <PreferencesCard onEdit={setEditTab} />
        </div>

        <div className="profile-col">
          <AchievementsCard onEdit={setEditTab} />
          <ProgressBanner />
          <SkillsCard onEdit={setEditTab} />
          <ExperienceCard onEdit={setEditTab} />
        </div>

        <div className="profile-col">
          <StatsCard />
          <CareerProgressCard />
          <SettingsCard theme={theme} onToggleTheme={onToggleTheme} />
        </div>
      </div>

      {editTab && <EditProfileModal initialTab={editTab} onClose={closeEditor} />}
    </main>
  );
}
