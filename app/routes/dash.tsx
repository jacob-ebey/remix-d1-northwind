import { json, type LoaderArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export function loader({ context: { cf } }: LoaderArgs) {
  return json({
    colo: cf?.colo || "unknown",
    country: (cf && "country" in cf ? cf?.country : null) || "country",
  });
}

export default function Dashboard() {
  const { colo, country } = useLoaderData<typeof loader>();

  return (
    <div className="card-content">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xl">Worker</p>
          <p className="text-gray-800 text-sm">Colo: {colo}</p>
          <p className="text-gray-800 text-sm">Country: {country}</p>
        </div>
        {/* <div>
          <p className="text-xl">SQL Metrics</p>
          <p className="text-gray-800 text-sm">Query count: {stats.queries}</p>
          <p className="text-gray-800 text-sm">
            Results count: {stats.results}
          </p>
          <p className="text-gray-800 text-sm"># SELECT: {stats.select}</p>
          <p className="text-gray-800 text-sm">
            # SELECT WHERE: {stats.select_where}
          </p>
          <p className="text-gray-800 text-sm">
            # SELECT LEFT JOIN: {stats.select_leftjoin}
          </p>
        </div> */}
      </div>
    </div>
  );
}
