import shopify from "../shopify.js";

/**
 * Fetches the existing metafield value.
 * @param {Object} client - Shopify GraphQL client.
 * @param {String} gid - App installation ID.
 * @returns {Array} Parsed metafield value or an empty array.
 */
const fetchMetafield = async (client, gid) => {
  const GET_METAFIELD_QUERY = `
    query AppInstallationMetafield($namespace: String!, $key: String!, $ownerId: ID!) {
      appInstallation(id: $ownerId) {
        apiKey: metafield(namespace: $namespace, key: $key) {
          value
        }
      }
    }
  `;

  const queryVariables = {
    namespace: "banner_data",
    key: "banner_data_key",
    ownerId: gid,
  };

  const queryResponse = await client.request(GET_METAFIELD_QUERY, { variables: queryVariables });
  const value = queryResponse?.data?.appInstallation?.apiKey?.value;

  if (!value) return [];

  try {
    return JSON.parse(value);
  } catch (parseError) {
    console.error("Error parsing existing metafield value. Initializing a new object.", parseError);
    return [];
  }
};

/**
 * Updates the metafield value based on the banner status.
 * @param {Array} metafieldValue - Existing metafield value.
 * @param {Object} banner - Banner data containing id, title, type, and status.
 * @returns {Array} Updated metafield value.
 */
const updateMetafieldValue = (metafieldValue, banner) => {
  const { id, title, type, status,link } = banner;
  const animation = type === "MOVING";

  if (status) {
    // Add or update the entry if status is true
    const existingIndex = metafieldValue.findIndex((entry) => entry.id === id);
    if (existingIndex !== -1) {
      metafieldValue[existingIndex] = { id, title, animation,link };
    } else {
      metafieldValue.push({ id, title, animation,link });
    }
  } else {
    // Remove the entry if status is false
    metafieldValue = metafieldValue.filter((entry) => entry.id !== id);
  }

  return metafieldValue;
};

/**
 * Saves the updated metafield value back to Shopify.
 * @param {Object} client - Shopify GraphQL client.
 * @param {String} gid - App installation ID.
 * @param {Array} updatedValue - Updated metafield value to save.
 */
const saveMetafield = async (client, gid, updatedValue) => {
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

  const mutationResponse = await client.request(UPDATE_METAFIELD_MUTATION, { variables: mutationVariables });

  if (mutationResponse.data.metafieldsSet.userErrors.length > 0) {
    throw new Error(
      `Metafield update failed: ${mutationResponse.data.metafieldsSet.userErrors
        .map((error) => error.message)
        .join(", ")}`
    );
  }

  console.log("Metafield updated successfully:", mutationResponse.data.metafieldsSet.metafields);
  return mutationResponse.data.metafieldsSet.metafields;
};

/**
 * Main function to handle metafield logic.
 * @param {String} gid - App installation ID.
 * @param {Object} session - Shopify session.
 * @param {Object} banner - Banner data containing id, title, type, and status.
 */
export default async (gid, session, banner) => {
  try {
    const client = new shopify.api.clients.Graphql({ session });

    // Fetch existing metafield value
    const metafieldValue = await fetchMetafield(client, gid);

    // Update the metafield value based on banner status
    const updatedValue = updateMetafieldValue(metafieldValue, banner);

    // Save the updated metafield back to Shopify
    return await saveMetafield(client, gid, updatedValue);
  } catch (error) {
    console.error("Error handling metafields:", error.message);
    throw error;
  }
};
