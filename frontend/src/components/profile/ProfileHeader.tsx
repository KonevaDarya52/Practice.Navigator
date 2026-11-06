import { Camera, Pencil } from "lucide-react";
import { useProfile } from "../../context/ProfileContext";
import { HeroStar } from "../HeroStar";
import type { EditTab } from "./EditProfileModal";

type Props = {
  onEdit: (tab: EditTab) => void;
};

export function ProfileHeader({ onEdit }: Props) {
  const { profile, displayName } = useProfile();

  return (
    <section className="profile-header">
      <HeroStar />

      <div className="profile-header__photo">
        <button className="photo-placeholder" aria-label="Изменить фото" onClick={() => onEdit("personal")}>
          {profile.photo ? (
            <img src={profile.photo} alt={displayName} />
          ) : (
            // Фото нет — показываем фотоаппарат
            <Camera size={40} strokeWidth={1.5} />
          )}
        </button>
        <button className="photo-edit" aria-label="Изменить фото" onClick={() => onEdit("personal")}>
          <Pencil size={15} />
        </button>
      </div>

      <div className="profile-header__info">
        <h1>{displayName}</h1>
        <p className="profile-header__status">
          {profile.status}
          {profile.openToOffers && <span className="status-pill">● Открыта для предложений</span>}
        </p>
        <p className="profile-header__university">{profile.university}</p>
        <div className="chips">
          {profile.faculty && <span className="chip">{profile.faculty}</span>}
          {profile.group && <span className="chip">Академическая группа {profile.group}</span>}
          <span className="chip">{profile.course} курс</span>
        </div>
      </div>

      <button className="btn btn--glass profile-header__edit" onClick={() => onEdit("personal")}>
        <Pencil size={15} /> Редактировать профиль
      </button>
    </section>
  );
}
