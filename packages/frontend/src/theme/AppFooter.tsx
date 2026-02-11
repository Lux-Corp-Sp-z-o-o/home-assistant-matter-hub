import GitHubIcon from "@mui/icons-material/GitHub";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { navigation } from "../routes.tsx";

export const AppFooter = () => {
  return (
    <Container sx={{ mt: 6, mb: 3 }}>
      <Divider sx={{ mb: 2 }} />
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={1}
      >
        <Typography variant="caption" color="text.disabled">
          Home Assistant Matter Hub
        </Typography>
        <Tooltip title="GitHub">
          <IconButton
            size="small"
            component={Link}
            href={navigation.githubRepository}
            target="_blank"
            sx={{ color: "text.disabled" }}
          >
            <GitHubIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Documentation">
          <IconButton
            size="small"
            component={Link}
            href={navigation.documentation}
            target="_blank"
            sx={{ color: "text.disabled" }}
          >
            <MenuBookIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Container>
  );
};
