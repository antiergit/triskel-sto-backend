import ProposalRoute from "./proposal/route";
import QuestionRoute from "./questionnaries/route";
// import AgentRoute from "./agent/route";
import SecondaryRoute from "./secondary/route";

const appControllersRoute = [
  new ProposalRoute(),
  new QuestionRoute(),
  // new AgentRoute(),
  new SecondaryRoute()


]

export default appControllersRoute;
