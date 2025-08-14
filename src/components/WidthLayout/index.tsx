import { Global } from "@emotion/react";

import { Box, Image } from "@chakra-ui/react";
import bgTop from "@/assets/img/dbt_bg_top.png";
import bgBottom from "@/assets/img/dbt_bg_bottom.png";

interface WidthLayoutProps {
  children: React.ReactNode; // Ensure children prop is defined
}

const WidthLayout: React.FC<WidthLayoutProps> = ({ children }) => {
  return (
    <>
      <Global
        styles={{
          "html, body": {
            overflowX: "inherit",
            background: "#eff8f3",
          },
          // Hide scrollbar for Chrome, Safari and Opera
          "::-webkit-scrollbar": {
            display: "none",
            width: 0,
            height: 0,
          },
          // Hide scrollbar for IE, Edge and Firefox
          "*": {
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          },
          // Ensure content is still scrollable
          ".scrollable-content": {
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
          },
        }}
      />
      <Box
        w={{ base: "100%", md: "420px" }} // Example width logic
        mx="auto" // Center the layout
        // boxShadow="0 4px 20px rgba(85 238 255)"
        minH={"100vh"}
        // bg="linear-gradient(to bottom, #FFFFFF, #FFFFFF)"
        className="scrollable-content"
      >
        <Box
          // 方案1: 使用style属性设置背景图片
          // style={{
          //   backgroundImage: `url(${bgTop.src})`,
          //   backgroundSize: 'cover',
          //   backgroundPosition: 'top center',
          //   backgroundRepeat: 'no-repeat',
          //   backgroundAttachment: 'fixed'
          // }}
          // 方案2: 使用Chakra UI的bg属性 (取消注释下面的行，注释上面的style)
          bg={`url(${bgTop.src})`}
          bgSize="100%"
          bgPos="top center"
          bgRepeat="no-repeat"
          
        >
          <Box
            bg={`url(${bgBottom.src})`}
            bgSize="100%"
            bgPos="bottom center"
            bgRepeat="no-repeat"
            minH={"100vh"}
          >
            {children} {/* Render children */}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default WidthLayout; // Ensure this is a default export
