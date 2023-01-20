import { type LoaderArgs } from "@remix-run/cloudflare";
import { Await, Link, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

import { AddTableField } from "~/components/tools";
import { maybeDefer } from "~/utils";

export function loader({ context, params }: LoaderArgs) {
  const employeePromise = context.DB.prepare(
    `
    SELECT Report.Id AS ReportId, Report.FirstName AS ReportFirstName, Report.LastName AS ReportLastName, Employee.Id, Employee.LastName, Employee.FirstName, Employee.Title, Employee.TitleOfCourtesy, Employee.BirthDate, Employee.HireDate, Employee.Address, Employee.City, Employee.Region, Employee.PostalCode, Employee.Country, Employee.HomePhone, Employee.Extension, Employee.Photo, Employee.Notes, Employee.ReportsTo, Employee.PhotoPath
    FROM Employee
    LEFT JOIN Employee AS Report ON Report.Id = Employee.ReportsTo
    WHERE Employee.Id = ?1
  `
  )
    .bind(params.id)
    .first<{
      Id: number;
      LastName: string;
      FirstName: string;
      Title: string;
      TitleOfCourtesy: string;
      BirthDate: string;
      HireDate: string;
      Address: string;
      City: string;
      Region: string;
      PostalCode: string;
      Country: string;
      HomePhone: string;
      Extension: string;
      Photo: string;
      Notes: string;
      ReportsTo: string;
      PhotoPath: string;
      ReportFirstName: string;
      ReportLastName: string;
    }>()
    .then((r) => r || null);

  return maybeDefer(context.session, {
    employeePromise,
  });
}

export default function Employee() {
  const { employeePromise } = useLoaderData<typeof loader>();

  return (
    <Suspense
      fallback={
        <div className="card-content">
          <h2>Loading employee...</h2>
        </div>
      }
    >
      <Await
        resolve={employeePromise}
        children={(employee) =>
          !employee ? (
            <div className="card-content">
              <h2>Employee not found</h2>
            </div>
          ) : (
            <div className="card mb-6">
              <header className="card-header">
                <p className="card-header-title">
                  <span className="icon material-icons">ballot</span>
                  <span className="ml-2">Employee information</span>
                </p>
              </header>
              <div className="card-content">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <AddTableField
                      name="Name"
                      value={`${employee.FirstName} ${employee.LastName}`}
                    />
                    <AddTableField name="Title" value={employee.Title} />
                    <AddTableField
                      name="Title Of Courtesy"
                      value={employee.TitleOfCourtesy}
                    />
                    <AddTableField
                      name="Birth Date"
                      value={employee.BirthDate}
                    />
                    <AddTableField name="Hire Date" value={employee.HireDate} />
                    <AddTableField name="Address" value={employee.Address} />
                    <AddTableField name="City" value={employee.City} />
                  </div>
                  <div>
                    <AddTableField
                      name="Postal Code"
                      value={employee.PostalCode}
                    />
                    <AddTableField name="Country" value={employee.Country} />
                    <AddTableField
                      name="Home Phone"
                      value={employee.HomePhone}
                    />
                    <AddTableField
                      name="Extension"
                      value={employee.Extension}
                    />
                    <AddTableField name="Notes" value={employee.Notes} />
                    {employee.ReportsTo ? (
                      <AddTableField
                        name="Reports To"
                        link={`/employee/${employee.ReportsTo}`}
                        value={`${employee.ReportFirstName} ${employee.ReportLastName}`}
                      />
                    ) : (
                      false
                    )}
                  </div>
                </div>

                <hr />

                <div className="field grouped">
                  <div className="control">
                    <Link to="/employees" className="button red">
                      Go back
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      />
    </Suspense>
  );
}
