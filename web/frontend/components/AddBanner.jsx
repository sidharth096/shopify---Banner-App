import React, { useState } from "react";
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
import { useNavigate } from "react-router-dom";

const AddBanner = ({ onBannerAdded }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("SIMPLE");
  const [status, setStatus] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const bannerTypes = [
    { label: "Simple", value: "SIMPLE" },
    { label: "Moving", value: "MOVING" },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/createBanner?shop=${shopify?.config?.shop}&host=${shopify?.config?.host}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type, status, title }),
        }
      );

      const data = await response.json();
      if (data.success) {
        onBannerAdded();
        shopify.toast.show("Banner created ", {
          duration: 5000,
        });
      } else {
        console.error("Failed to create banner");
        shopify.toast.show(data.message, {
          duration: 5000,
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Error creating banner:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page
      title="Add Banner"
      backAction={{
        content: "Back",
        onAction: () => navigate("/"),
      }}
      primaryAction={
        <Button primary loading={loading} onClick={handleSubmit}>
          Publish
        </Button>
      }
    >
      {" "}
      <Grid>
        <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
          <LegacyCard title="Add Banner" sectioned>
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
              {title}
            </Text>
            {/* <p style={{ textAlign: "center" }} >{title}</p> */}
          </LegacyCard>
        </Grid.Cell>
      </Grid>
    </Page>
  );
};

export default AddBanner;
