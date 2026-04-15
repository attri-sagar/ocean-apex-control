import AgentProfiles from "./AgentProfiles";
import { ErrorBoundary } from "./ErrorBoundary";

export default function AgentProfilesWrapper() {
  return (
    <ErrorBoundary>
      <AgentProfiles />
    </ErrorBoundary>
  );
}
