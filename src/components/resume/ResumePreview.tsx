import { forwardRef } from "react";
import type { ResumeData, TemplateId } from "@/context/ResumeContext";

const TEMPLATE_STYLE: Record<TemplateId, { heading: string; body: string; wrapper: string }> = {
  classic: {
    heading: "font-serif",
    body: "font-serif text-[13px] leading-relaxed",
    wrapper: "",
  },
  modern: {
    heading: "",
    body: "text-[13px] leading-relaxed",
    wrapper: "border-l-4 border-l-[#4F46E5] pl-6",
  },
  compact: {
    heading: "",
    body: "text-[12px] leading-snug",
    wrapper: "",
  },
};

export const ResumePreview = forwardRef<HTMLDivElement, { resume: ResumeData; template: TemplateId }>(
  function ResumePreview({ resume, template }, ref) {
    const style = TEMPLATE_STYLE[template];
    const contacts = [resume.email, resume.phone, resume.location, resume.linkedin, resume.portfolio].filter(
      Boolean,
    );

    return (
      <div
        ref={ref}
        className={`resume-doc ${style.body} rounded-md p-8 shadow-card`}
        style={{ minHeight: 900 }}
      >
        <div className={style.wrapper}>
          <header className="mb-4">
            <h1 className={style.heading}>{resume.fullName || "Your Name"}</h1>
            {resume.jobTitle ? (
              <p className="mt-0.5 text-[13px] font-medium" style={{ color: "#4F46E5" }}>
                {resume.jobTitle}
              </p>
            ) : null}
            {contacts.length > 0 ? (
              <p className="mt-1 text-[11px]" style={{ color: "#6B7280" }}>
                {contacts.join(" · ")}
              </p>
            ) : null}
          </header>

          {resume.summary ? (
            <section className="mb-4">
              <h2 className={style.heading}>Professional Summary</h2>
              <p>{resume.summary}</p>
            </section>
          ) : null}

          {resume.experience.length > 0 ? (
            <section className="mb-4">
              <h2 className={style.heading}>Work Experience</h2>
              <div className="space-y-3">
                {resume.experience.map((entry) => (
                  <div key={entry.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-semibold">
                        {entry.title || "Job Title"}
                        {entry.company ? ` — ${entry.company}` : ""}
                      </p>
                      <p className="text-[11px]" style={{ color: "#6B7280" }}>
                        {entry.startDate}
                        {entry.startDate || entry.endDate || entry.current ? " – " : ""}
                        {entry.current ? "Present" : entry.endDate}
                      </p>
                    </div>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5">
                      {entry.bullets.filter(Boolean).map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {resume.education.length > 0 ? (
            <section className="mb-4">
              <h2 className={style.heading}>Education</h2>
              <div className="space-y-1.5">
                {resume.education.map((entry) => (
                  <div key={entry.id} className="flex flex-wrap justify-between gap-2">
                    <p>
                      <span className="font-semibold">{entry.degree || "Degree"}</span>
                      {entry.institution ? `, ${entry.institution}` : ""}
                      {entry.gpa ? ` · GPA ${entry.gpa}` : ""}
                    </p>
                    <p className="text-[11px]" style={{ color: "#6B7280" }}>
                      {entry.year}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {resume.certifications.length > 0 ? (
            <section className="mb-4">
              <h2 className={style.heading}>Certifications</h2>
              <ul className="list-disc space-y-0.5 pl-5">
                {resume.certifications.map((cert) => (
                  <li key={cert.id}>
                    {cert.name}
                    {cert.issuer ? ` — ${cert.issuer}` : ""}
                    {cert.year ? ` (${cert.year})` : ""}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {resume.skills.length > 0 ? (
            <section>
              <h2 className={style.heading}>Skills</h2>
              <p>{resume.skills.join(" · ")}</p>
            </section>
          ) : null}
        </div>
      </div>
    );
  },
);
