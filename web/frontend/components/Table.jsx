import {
  Page,
  LegacyCard,
  DataTable,
  Button,
  Spinner,
  Icon,
  Modal,
  Text,
  Badge,
} from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeleteIcon, EditIcon } from "@shopify/polaris-icons";

export const Table = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalActive, setModalActive] = useState(false);
  const [selectedBannerId, setSelectedBannerId] = useState(null);
  const navigate = useNavigate();

  // Function to fetch banners from the API
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/getBanners?shop=${shopify?.config?.shop}&host=${shopify?.config?.host}`);
      const data = await response.json();

      // Map the API response to the table rows
      const bannerRows = data.banners.map((banner) => [
        banner.name || "No Name",
        banner.type,
        <Badge status={banner.status ? "success" :  "warning"}> { banner.status ?  "Active" : "Inactive"}</Badge> ,

        <div style={{ display: "flex", gap: "8px" }}>
          <Button plain onClick={() => handleEdit(banner.id)}>
            <Icon source={EditIcon} tone="base" />
          </Button>
          <Button
            plain
            destructive
            onClick={() => openDeleteModal(banner.id)}
          >
            <Icon source={DeleteIcon} tone="critical" />
          </Button>
        </div>,
      ]);

      setRows(bannerRows);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/EditBanner/${id}`);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/deleteBanner/${selectedBannerId}?shop=${shopify?.config?.shop}&host=${shopify?.config?.host}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if(data.success){
       fetchBanners();
      }else{
        shopify.toast.show(data.message, {
          isError: true,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error deleting the banner:", error);
    } finally {
      closeDeleteModal();
    }
  };

  const openDeleteModal = (id) => {
    setSelectedBannerId(id);
    setModalActive(true);
  };

  const closeDeleteModal = () => {
    setSelectedBannerId(null);
    setModalActive(false);
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
          <Button onClick={() => navigate("/AddNewBanner")} primary>
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
          ) : rows.length > 0 ? (
            <DataTable
              columnContentTypes={["text", "text", "text", "text"]}
              headings={["Banner name", "Type", "Status", "Actions"]}
              rows={rows}
            />
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "gray",
              }}
            >
              No banners available.
            </div>
          )}
        </LegacyCard>
      </Page>

      {modalActive && (
        <Modal
          open={modalActive}
          onClose={closeDeleteModal}
          title="Are you sure you want to delete this banner?"
          primaryAction={{
            content: "Delete",
            destructive: true,
            onAction: handleDelete,
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: closeDeleteModal,
            },
          ]}
        >
          <Modal.Section>
            <Text>
              <p>
                Deleting this banner is permanent and cannot be undone. Are you
                sure you want to proceed?
              </p>
            </Text>
          </Modal.Section>
        </Modal>
      )}
    </>
  );
};
