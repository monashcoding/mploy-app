import Link from "next/link";
import {
  IconArrowRight,
  IconChartBar,
  IconClipboardList,
  IconDevices,
  IconLock,
  IconTimelineEvent,
} from "@tabler/icons-react";

type AuthRequiredScreen = "applications" | "statistics";

const screenCopy = {
  applications: {
    eyebrow: "Applications",
    title: "Sign in to manage your application tracker",
    description:
      "You can keep browsing jobs without an account. Sign in when you want full functionality, application tracking, saved statuses, and sync across devices.",
    callbackUrl: "/my-applications",
    features: [
      {
        icon: IconClipboardList,
        title: "Application board",
        description: "Save roles and move them through your pipeline.",
      },
      {
        icon: IconDevices,
        title: "Device sync",
        description: "Keep your tracker consistent anywhere you sign in.",
      },
    ],
  },
  statistics: {
    eyebrow: "Statistics",
    title: "Sign in to unlock your application statistics",
    description:
      "Statistics are built from your tracked applications. Sign in for full functionality, tracking, pipeline movement, and progress across each recruitment cycle.",
    callbackUrl: "/statistics",
    features: [
      {
        icon: IconChartBar,
        title: "Pipeline insights",
        description: "See how many roles reach each stage.",
      },
      {
        icon: IconTimelineEvent,
        title: "Status history",
        description: "Turn tracked updates into useful trends.",
      },
    ],
  },
} satisfies Record<
  AuthRequiredScreen,
  {
    eyebrow: string;
    title: string;
    description: string;
    callbackUrl: string;
    features: {
      icon: typeof IconClipboardList;
      title: string;
      description: string;
    }[];
  }
>;

export default function AuthRequiredPanel({
  screen,
}: {
  screen: AuthRequiredScreen;
}) {
  const copy = screenCopy[screen];
  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent(copy.callbackUrl)}`;

  return (
    <section
      className="auth-required-panel"
      aria-labelledby="auth-required-title"
    >
      <div className="auth-required-copy">
        <div className="auth-required-kicker">
          <span className="auth-required-lock" aria-hidden>
            <IconLock size={15} />
          </span>
          {copy.eyebrow}
        </div>
        <h1 id="auth-required-title">{copy.title}</h1>
        <p>{copy.description}</p>
        <div className="auth-required-actions">
          <Link className="auth-required-primary" href={signInHref}>
            Sign in
            <IconArrowRight size={16} aria-hidden />
          </Link>
          <Link className="auth-required-secondary" href="/jobs">
            Browse jobs
          </Link>
        </div>
      </div>

      <div className="auth-required-feature-grid" aria-label="Sign-in benefits">
        {copy.features.map((feature) => {
          const FeatureIcon = feature.icon;

          return (
            <div className="auth-required-feature" key={feature.title}>
              <span aria-hidden>
                <FeatureIcon size={19} />
              </span>
              <div>
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
