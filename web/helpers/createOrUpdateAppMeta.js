import shopify from "../shopify.js";

export default async (gid, session,banner) => {
  try {
    // Initialize GraphQL client with the session
    const { id, title, type } = banner;
    let animation
    type == "MOVING" ? animation = true: animation = false
    const client = new shopify.api.clients.Graphql({ session });

    // Query to retrieve the existing metafield
    const GET_METAFIELD_QUERY = `
      query AppInstallationMetafield($namespace: String!, $key: String!, $ownerId: ID!) {
        appInstallation(id: $ownerId) {
          apiKey: metafield(namespace: $namespace, key: $key) {
            value
          }
        }
      }
    `;

    // Variables for retrieving the metafield
    const queryVariables = {
      namespace: "banner_data",
      key: "banner_data_key",
      ownerId: gid,
    };



    // Execute the GraphQL query to retrieve the metafield
    const queryResponse = await client.request(GET_METAFIELD_QUERY, { variables:queryVariables});


    // Extract and parse the value of the `apiKey` metafield
    let value = queryResponse?.data?.appInstallation?.apiKey?.value;
    let updatedValue = [];

    if (value) {
      // Parse the existing JSON value if it exists
      try {
        updatedValue = JSON.parse(value);
      } catch (parseError) {
        console.error("Error parsing existing metafield value. Initializing a new object.", parseError);
      }
    }

    // Add the new id and title pair to the JSON object
    updatedValue = [...updatedValue, {id: id, title: title, animation:animation}];


    // Mutation to update the metafield
    const UPDATE_METAFIELD_MUTATION = `
      mutation CreateAppDataMetafield($metafieldsSetInput: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafieldsSetInput) {
          metafields {
            id
            namespace
            key
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    // Input variables for the mutation
    const mutationVariables = {
      metafieldsSetInput: [
        {
          namespace: "banner_data",
          key: "banner_data_key",
          type: "json",
          value: JSON.stringify(updatedValue),
          ownerId: gid,
        },
      ],
    };

    // Execute the GraphQL mutation to update the metafield
    const mutationResponse = await client.request(UPDATE_METAFIELD_MUTATION,  { variables: mutationVariables });

    // Handle response
    if (mutationResponse.data.metafieldsSet.userErrors.length > 0) {
      throw new Error(
        `Metafield update failed: ${mutationResponse.data.metafieldsSet.userErrors
          .map((error) => error.message)
          .join(", ")}`
      );
    }

    console.log("Metafield updated successfully:", mutationResponse.data.metafieldsSet.metafields);
    return mutationResponse.data.metafieldsSet.metafields;
  } catch (error) {
    console.error("Error handling metafields:", error.message);
    throw error;
  }
};
