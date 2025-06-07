import type * as React from 'react';
import { Link } from 'react-router';
// import { SearchForm } from "~/components/search-form"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  // SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar';
import { tools } from '~/lib/tools';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar();

  function closeSidebar() {
    setOpenMobile(false);
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link to="/" onClick={closeSidebar}>
          <h1 className="font-bold text-3xl p-2 font-mono">Grug Tools</h1>
        </Link>
        {/* <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent>
        {tools.map((item) => (
          <SidebarGroup key={item.title}>
            {/* <SidebarGroupLabel>{item.title}</SidebarGroupLabel> */}
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} onClick={closeSidebar}>
                        <item.Icon className="text-gray-500" /> {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
