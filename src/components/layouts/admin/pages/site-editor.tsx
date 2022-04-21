import { Route, Routes, useNavigate, useParams } from "react-router-dom"
import SiteEditorPageEditor from "./site-editor-page-editor"
import { PageTree } from "./site-editor-page-tree"
import { PageHeader, Tabs, Button, Statistic, Descriptions, Layout } from 'antd';
import { SubPageLayout } from "../sub-page-layout";
import { SiteEditorContainer } from "../components/site-editor-container";

const { TabPane } = Tabs;
const { Header, Content,Footer } = Layout;


export const SiteEditor: React.FC<any> = (props) => {
  const params = useParams();
  const overFlow =  props.fixedHeader ? 'scroll' : 'unset';
  const navigate = useNavigate();

  const handleTabChange = (key: string) => {
    console.log(key)
    navigate(`./${key}`)
  }

  return (

  <SubPageLayout
    fixedHeader={true}
    header={    
      <PageHeader
          className="site-page-header-responsive"
          title="Site Editor"
          subTitle="Edit your site"          
          footer={
            <Tabs defaultActiveKey="page-tree" onChange={handleTabChange}>
              <TabPane tab="Pages" key="page-tree" />
              <TabPane tab="Editor" key="page-editor" />
            </Tabs>
          }
          extra={[
            <SiteEditorContainer data={{communityId:params.communityId ?? ''}} />
          ]}
        >
      </PageHeader>
    }
  >
        
    <Routes>
      <Route path="*" element={<PageTree />} />
      <Route path="page-editor" element={<SiteEditorPageEditor />} />
    </Routes>

  </SubPageLayout>
  )
}