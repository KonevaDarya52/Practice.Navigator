import { ArrowRight, Building2 } from "lucide-react";
import type { PracticeRequest } from "../api/types";
import { companyInitials, formatDate } from "../lib/format";

type RequestCardProps = {
  request: PracticeRequest;
  match: number | null;
};

export function RequestCard({ request, match }: RequestCardProps) {
  return (
    <article className="request-card">
      <div className="request-card__logo">{companyInitials(request.organization.name)}</div>

      <div className="request-card__body">
        <h4>{request.title}</h4>
        <p className="request-card__meta">
          <span>
            <Building2 size={13} /> {request.organization.name}
          </span>
          {request.city && <span>{request.city}</span>}
          <span>{request.format}</span>
          <span>
            {formatDate(request.dateFrom)} — {formatDate(request.dateTo)}
          </span>
        </p>
        <p className="request-card__text">{request.description}</p>
      </div>

      <div className="request-card__side">
        {match !== null && <span className="match">{match}% совпадение</span>}
        <div className="request-card__actions">
          <a href="#" className="btn btn--solid btn--sm">
            Подробнее
          </a>
          <a href="#" className="btn btn--outline btn--sm">
            Откликнуться <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </article>
  );
}
