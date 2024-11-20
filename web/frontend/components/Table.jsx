import { Page, LegacyCard, DataTable, Button } from "@shopify/polaris";
import React from "react";

export const Table = () => {
  const rows = [
    ["Emerald Silk Gown", "simple", true,],
    ["Mauve Cashmere Scarf", "rotate", false],
    [
      "Navy Merino Wool Blazer with khaki chinos and yellow belt",
      "simple",
      true,

    ],
  ];

  const handleAddBanner = async() => {
    console.log("Add New Banner clicked!");
    const response = await fetch(`/api/createBanner`);

    console.log(response);
    
  };

  return (
    <>
      <Page
        title="Banners"
        primaryAction={
          <Button onClick={handleAddBanner} primary>
            Add New Banner
          </Button>
        }
       >
        <LegacyCard>
          <DataTable
            columnContentTypes={[
              "text",
              "text",
              "boolean",
            ]}
            headings={[
              "Banner name",
              "Type",
              "Status",
            ]}
            rows={rows}
          />
        </LegacyCard>
      </Page>
    </>
  );
};
