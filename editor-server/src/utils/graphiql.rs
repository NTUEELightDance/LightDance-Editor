#[derive(Default)]
pub struct GraphiQLBuilder<'a> {
    version: &'a str,
    endpoint: &'a str,
    subscription_endpoint: &'a str,
}

impl<'a> GraphiQLBuilder<'a> {
    pub fn build() -> GraphiQLBuilder<'a> {
        Default::default()
    }

    pub fn version(self, version: &'a str) -> GraphiQLBuilder<'a> {
        GraphiQLBuilder { version, ..self }
    }

    pub fn endpoint(self, endpoint: &'a str) -> GraphiQLBuilder<'a> {
        GraphiQLBuilder { endpoint, ..self }
    }

    pub fn subscription_endpoint(self, subscription_endpoint: &'a str) -> GraphiQLBuilder {
        GraphiQLBuilder {
            subscription_endpoint,
            ..self
        }
    }

    pub fn finish(self) -> String {
        format!(
            r#"
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="robots" content="noindex">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="referrer" content="origin">

            <title>GraphiQL IDE</title>

            <style>
              body {{
                height: 100%;
                margin: 0;
                width: 100%;
                overflow: hidden;
              }}

              #graphiql {{
                height: 100vh;
              }}
            </style>
            <script
              crossorigin
              src="https://unpkg.com/react@17/umd/react.development.js"
            ></script>
            <script
              crossorigin
              src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"
            ></script>
            <link rel="icon" href="https://graphql.org/favicon.ico">
            <link rel="stylesheet" href="https://unpkg.com/graphiql@{}/graphiql.min.css" />
          </head>

          <body>
            <div id="graphiql">Loading...</div>
            <script
              src="https://unpkg.com/graphiql@{}/graphiql.min.js"
              type="application/javascript"
            ></script>
            <script>
              customFetch = (url, opts = {{}}) => {{
                return fetch(url, {{...opts, credentials: 'same-origin'}})
              }}

              createUrl = (endpoint, subscription = false) => {{
                const url = new URL(endpoint, window.location.origin);
                if (subscription) {{
                  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
                }}
                return url.toString();
              }}

              ReactDOM.render(
                React.createElement(GraphiQL, {{
                  fetcher: GraphiQL.createFetcher({{
                    url: createUrl('{}'),
                    fetch: customFetch,
                    subscriptionUrl: createUrl('{}', true),
                  }}),
                  defaultEditorToolsVisibility: true,
                }}),
                document.getElementById("graphiql")
              );
            </script>
          </body>
        </html>
        "#,
            self.version, self.version, self.endpoint, self.subscription_endpoint,
        )
    }
}
