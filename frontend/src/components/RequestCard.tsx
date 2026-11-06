import type { PracticeRequest } from "../data/mock";

type RequestCardProps = {
  request: PracticeRequest;
};

export function RequestCard({ request }: RequestCardProps) {
  return (
    <article className="request-card">
      <div className="request-card__logo">{request.companyShort}</div>
      <div>
        <h4>{request.title}</h4>
        <p>
          {request.company} · {request.city} · {request.format} · {request.dateFrom} —{" "}
          {request.dateTo}
        </p>
        <p>{request.description}</p>
        <div className="tags">
          <span className="tag">{request.direction}</span>
          <span className="tag">{request.places} мест</span>
          <span className="tag tag--burg">{request.paid ? "Оплачиваемая" : "Неоплачиваемая"}</span>
        </div>
      </div>
      <div className="request-card__side">
        <span className="match">{request.match}% совпадение</span>
        <div className="request-card__actions">
          <a href="#" className="btn btn--navy btn--sm">
            Подробнее
          </a>
          <a href="#" className="btn btn--primary btn--sm">
            Откликнуться →
          </a>
        </div>
      </div>
    </article>
  );
}
