import { Page, LegacyCard, DataTable, Button, Spinner } from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Table = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to fetch banners from the API
  const fetchBanners = async () => {
    setLoading(true); // Start loading spinner
    try {
      const response = await fetch(`/api/getBanners?shop=${shopify?.config?.shop}&host=${shopify?.config?.host}`);
      const data = await response.json();

      console.log(data);

      // Map the API response to the table rows
      const bannerRows = data.banners.map((banner) => [
        banner.name || "No Name",
        banner.type,
        banner.status ? "Active" : "Inactive",
      ]);

      setRows(bannerRows); // Update rows state
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  // Fetch banners when the component mounts
  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <>
      <Page
        title="Banners"
        primaryAction={
          <Button onClick={()=>navigate("/AddNewBanner")} primary>
            Add New Banner
          </Button>
        }
      >
        <LegacyCard>
          {loading ? (
             <div
             style={{
               display: "flex",
               justifyContent: "center",
               alignItems: "center",
               height: "200px", 
             }}
           >
             <Spinner accessibilityLabel="Loading banners" size="large" />
           </div>
          ) : (
            <DataTable
              columnContentTypes={["text", "text", "text"]}
              headings={["Banner name", "Type", "Status"]}
              rows={rows}
            />
          )}
        </LegacyCard>
      </Page>
    </>
  );
};
