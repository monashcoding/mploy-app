import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How MAC Jobs Board collects, uses, stores, and shares personal information.",
};

const lastUpdated = "May 25, 2026";

const providerLinks = [
  {
    name: "PostHog",
    href: "https://posthog.com/privacy",
  },
  {
    name: "Google",
    href: "https://policies.google.com/privacy",
  },
  {
    name: "Vercel",
    href: "https://vercel.com/legal/privacy-policy",
  },
  {
    name: "Notion",
    href: "https://www.notion.com/privacy",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto h-[calc(100svh-112px)] max-w-5xl overflow-y-auto pb-24 pt-8 text-white">
      <header className="mb-10 border-b border-white/10 pb-8">
        <p className="mb-3 text-sm font-semibold text-accent">
          Last updated {lastUpdated}
        </p>
        <h1 className="text-3xl font-bold leading-tight md:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-white/70 md:text-base">
          This Privacy Policy explains how MAC Jobs Board collects, uses,
          stores, and shares information when you use our job board, create an
          account, save applications, send feedback, or interact with our
          analytics and performance tools.
        </p>
      </header>

      <article className="space-y-9 text-sm leading-7 text-white/75 md:text-base">
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">Who We Are</h2>
          <p>
            MAC Jobs Board is a job discovery and application tracking service.
            In this policy, &quot;we&quot;, &quot;us&quot;, and &quot;our&quot;
            refer to the people operating MAC Jobs Board. &quot;You&quot; refers
            to people who visit or use the site.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            Information We Collect
          </h2>
          <p>
            We collect information you provide directly, information created
            through your use of the service, and limited technical information
            collected automatically.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              Account information, including your email address, optional name,
              password hash for email/password accounts, and Google account
              profile details if you sign in with Google.
            </li>
            <li>
              Application tracking information, including saved jobs, custom job
              entries, companies, roles, application statuses, recruitment
              cycles, starred jobs, notes, and status history.
            </li>
            <li>
              Feedback information, including the message you submit and any
              email address you choose to include.
            </li>
            <li>
              Usage and analytics information, including pages viewed, page
              leave events, browser and device details, approximate location
              derived from network information, referring pages, cookies or
              local storage identifiers, and similar technical data.
            </li>
            <li>
              Local browser data, including preferences and temporary
              application tracking data stored in your browser so the site can
              keep working smoothly between visits.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            How We Use Information
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              To create accounts, authenticate users, and keep you signed in.
            </li>
            <li>
              To save and sync your application tracker, notes, statuses, and
              statistics.
            </li>
            <li>
              To provide job search, filtering, job details, and related product
              features.
            </li>
            <li>
              To respond to feedback, investigate bugs, improve performance, and
              decide what to build next.
            </li>
            <li>
              To detect abuse, protect accounts, maintain security, and comply
              with legal obligations.
            </li>
            <li>
              To send service-related messages, such as account, security, or
              important product notices. We will only send marketing messages
              where permitted by law.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            Analytics, Cookies, and Similar Technologies
          </h2>
          <p>
            We use PostHog, Google Analytics, Vercel Analytics, and Vercel Speed
            Insights to understand how the site is used and how it performs.
            These tools may use cookies, local storage, pixels, or similar
            technologies to collect usage and technical information. You can
            limit cookies through your browser settings, and some browsers or
            extensions may block analytics requests.
          </p>
          <p className="mt-4">
            We do not intentionally send sensitive application notes or
            passwords to analytics providers. You should avoid putting sensitive
            personal information into fields where it is not needed.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            When We Share Information
          </h2>
          <p>
            We share information with service providers that help us run the
            site. These providers are allowed to process information only for
            the purposes described in this policy and their own applicable
            terms.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>
              Database and hosting providers, including MongoDB and Azure.
            </li>
            <li>
              Authentication providers, including NextAuth and Google sign-in
              where you choose to use Google.
            </li>
            <li>
              Analytics and performance providers, including PostHog, Google
              Analytics, Vercel Analytics, and Vercel Speed Insights.
            </li>
            <li>
              Feedback tooling, including Notion, when you submit feedback
              through the site.
            </li>
            <li>
              Professional, legal, security, or compliance advisers if needed to
              protect users, the service, or our legal rights.
            </li>
          </ul>
          <p className="mt-4">
            We do not sell personal information for money. We also do not
            knowingly share personal information for cross-context behavioral
            advertising.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">Data Retention</h2>
          <p>
            We keep account and application tracking information for as long as
            your account is active or as long as needed to provide the service.
            If you delete application entries, we stop using those entries in
            the active product. Feedback, analytics, logs, and backup copies may
            be kept for a limited period where needed for support, security,
            debugging, legal compliance, or ordinary backup processes.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            Your Choices and Rights
          </h2>
          <p>
            Depending on where you live, you may have rights to access, correct,
            delete, export, restrict, or object to certain uses of your personal
            information. You may also have the right to withdraw consent where
            processing is based on consent.
          </p>
          <p className="mt-4">
            To make a privacy request, use the feedback button in the app and
            include the email address connected to your account so we can verify
            and respond to the request. If your request is sensitive, do not
            post it in a public GitHub issue.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            International Processing
          </h2>
          <p>
            We and our service providers may process and store information in
            countries other than your own, including Australia, the United
            States, and other locations where our providers operate. Where
            required, we rely on appropriate safeguards for international data
            transfers.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">Security</h2>
          <p>
            We use reasonable technical and organisational measures designed to
            protect personal information, including password hashing for
            email/password accounts. No online service can guarantee perfect
            security, so you should use a strong password and keep your account
            credentials private.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">Children</h2>
          <p>
            MAC Jobs Board is not directed to children under 13. If you believe
            a child has provided personal information without appropriate
            consent, contact us through the feedback button and we will review
            the request.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">
            Changes to This Policy
          </h2>
          <p>
            We may update this policy from time to time. If we make material
            changes, we will update the date above and, where appropriate,
            provide additional notice in the site.
          </p>
        </section>

        <section className="border-t border-white/10 pt-7">
          <h2 className="mb-3 text-xl font-bold text-white">
            Third-Party Privacy Policies
          </h2>
          <p>
            These links may help you understand how some of our service
            providers handle information:
          </p>
          <ul className="mt-4 flex flex-wrap gap-3">
            {providerLinks.map((provider) => (
              <li key={provider.name}>
                <a
                  className="font-semibold text-accent underline underline-offset-4"
                  href={provider.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {provider.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </div>
  );
}
