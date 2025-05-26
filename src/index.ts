import {
  createStatefulMiddleware,
  createWorkflow,
  workflowEvent,
} from "@llamaindex/workflow";

// Define our workflow events
const startEvent = workflowEvent<string>(); // Input topic for joke
const resultEvent = workflowEvent<{ joke: string }>(); // Final joke

// Create our workflow
const { withState, getContext } = createStatefulMiddleware(() => ({
  numIterations: 0,
  maxIterations: 3,
}));
const jokeFlow = withState(createWorkflow());

// Define handlers for each step
jokeFlow.handle([startEvent], async (event) => {
  const joke = `Here is a wonderful joke about ${event.data}`;

  return resultEvent.with({ joke: joke });
});

// Usage
async function main() {
  const { stream, sendEvent } = jokeFlow.createContext();
  sendEvent(startEvent.with("pirates"));

  let result: { joke: string } | undefined;

  for await (const event of stream) {
    // console.log(event.data);  optionally log the event data
    if (resultEvent.include(event)) {
      result = event.data;
      break; // Stop when we get the final result
    }
  }

  console.log(result);
}

main().catch(console.error);
