import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import store from "./store";
// test for websocket
import WebSocketContext from "./contexts/WebSocketContext";
import WaveSurferAppContext from "./contexts/WavesurferContext";
import LayoutContextProvider from "./contexts/LayoutContext";

import App from "./app";

import {
	ApolloClient,
	InMemoryCache,
	ApolloProvider,
	HttpLink,
	split,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";

const httpLink = new HttpLink({
	uri: "http://localhost:4000",
});

const wsLink = new WebSocketLink({
	uri: "ws://localhost:4000/graphql",
	options: {
		reconnect: true,
	},
});

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value
const splitLink = split(
	({ query }) => {
		const definition = getMainDefinition(query);
		return (
			definition.kind === "OperationDefinition" &&
			definition.operation === "subscription"
		);
	},
	wsLink,
	httpLink
);
const client = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache().restore({}),
});
const Index = () => (
	<ApolloProvider client={client}>
		<Provider store={store}>
			<WebSocketContext>
				<WaveSurferAppContext>
					<LayoutContextProvider>
						<App />
					</LayoutContextProvider>
				</WaveSurferAppContext>
			</WebSocketContext>
		</Provider>
	</ApolloProvider>
);

ReactDOM.render(<Index />, document.getElementById("app"));
