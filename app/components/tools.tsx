import { Link } from "@remix-run/react";

export function AddTableField(props: {
  name: string;
  link?: string;
  value: string | number;
}) {
  return (
    <div className="field">
      <label className="label">{props.name}</label>
      <div className="field-body">
        <div className="field">
          <div className="control icons-left">
            {props.link ? (
              <Link to={props.link} className="link">
                {props.value}
              </Link>
            ) : (
              `${props.value}`
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
