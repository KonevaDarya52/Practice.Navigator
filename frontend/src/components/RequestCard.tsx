import { ArrowRight, Building2 } from "lucide-react";
import type { PracticeRequest } from "../data/mock";

type RequestCardProps = {
  request: PracticeRequest;
};

export function RequestCard({ request }: RequestCardProps) {
  return (
    <article className="request-card">
      <div className="request-card__logo">{request.companyShort}</div>

      <div className="request-card__body">
        <h4>{request.title}</h4>
        <p className="request-card__meta">
          <span>
            <Building2 size={13} /> {request.company}
          </span>
          <span>{request.city}</span>
          <span>{request.format}</span>
          <span>
            {request.dateFrom} — {request.dateTo}
          </span>
        </p>
        <p className="request-card__text">{request.description}</p>
      </div>

      <div className="request-card__side">
        <span className="match">{request.match}% совпадение</span>
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
