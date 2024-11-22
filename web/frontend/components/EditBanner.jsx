import React, { useState, useEffect } from "react";
import {
  FormLayout,
  TextField,
  Select,
  Checkbox,
  Button,
  Page,
  Grid,
  LegacyCard,
  Text,
} from "@shopify/polaris";
import { useNavigate, useParams } from "react-router-dom";

const EditBanner = ({ onBannerUpdated }) => {
  const { id } = useParams(); // Use params to get the banner ID

  console.log("=======================", id);

  const [name, setName] = useState("");
  const [type, setType] = useState("SIMPLE");
  const [status, setStatus] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true); // For API loading state
  const navigate = useNavigate();

  const bannerTypes = [
    { label: "Simple", value: "SIMPLE" },
    { label: "Moving", value: "MOVING" },
  ];

  // Fetch banner details on component mount or when ID changes
  useEffect(() => {
    const fetchBannerDetails = async () => {
      if (!id) {
        console.error("No banner ID provided.");
        setFetching(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/getBannerDetails/${id}?shop=${shopify?.config?.shop}&host=${shopify?.config?.host}`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setName(data.banner.name || "");
          setType(data.banner.type || "SIMPLE");
          setStatus(data.banner.status || false);
          setTitle(data.banner.title || "");
        } else {
          shopify.toast.show(data.message || "Failed to fetch banner details", {
            duration: 5000,
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching banner details:", error);
        shopify.toast.show("An error occurred. Please try again.", {
          duration: 5000,
        });
        navigate("/");
      } finally {
        setFetching(false);
      }
    };

    fetchBannerDetails();
  }, [id, navigate]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/editBanner/${id}?shop=${shopify?.config?.shop}&host=${shopify?.config?.host}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type, status, title }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        shopify.toast.show("Banner updated successfully", { duration: 5000 });
        if (onBannerUpdated) onBannerUpdated();
        navigate("/");
      } else {
        shopify.toast.show(data.message || "Failed to update the banner", {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error updating the banner:", error);
      shopify.toast.show("An error occurred. Please try again.", {
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Page
        title="Edit Banner"
        backAction={{
          content: "Back",
          onAction: () => navigate("/"),
        }}
      >
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
          <LegacyCard title="Edit Banner" sectioned>
            <Text variant="headingMd">Loading banner details...</Text>
          </LegacyCard>
          </Grid.Cell>
          <Grid.Cell
            columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}
          ><LegacyCard title="Preview" sectioned>
            </LegacyCard>
          </Grid.Cell>
        </Grid>
      </Page>
    );
  }

  return (
    <Page
      title="Edit Banner"
      backAction={{
        content: "Back",
        onAction: () => navigate("/"),
      }}
      primaryAction={
        <Button primary loading={loading} onClick={handleSubmit}>
          Update
        </Button>
      }
    >
      <Grid>
        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
          <LegacyCard title="Edit Banner" sectioned>
            <FormLayout>
              <TextField
                label="Banner Name"
                value={name}
                onChange={(value) => setName(value)}
                autoComplete="off"
              />
              <TextField
                label="Title"
                value={title}
                onChange={(value) => setTitle(value)}
                autoComplete="off"
              />
              <Select
                label="Type"
                options={bannerTypes}
                value={type}
                onChange={(value) => setType(value)}
              />
              <Checkbox
                label="Active"
                checked={status}
                onChange={(value) => setStatus(value)}
              />
            </FormLayout>
          </LegacyCard>
        </Grid.Cell>
        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
          <LegacyCard title="Preview" sectioned>
            <Text variant="heading2xl" as="h3" alignment="center">
              {title || "Banner Title Preview"}
            </Text>
          </LegacyCard>
        </Grid.Cell>
      </Grid>
    </Page>
  );
};

export default EditBanner;
