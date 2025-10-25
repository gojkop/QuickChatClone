import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardLayout } from '@/hooks/dashboardv2/useDashboardLayout';
import { useSearch } from '@/hooks/dashboardv2/useSearch';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopBar from './DashboardTopBar';
import MobileDrawer from './MobileDrawer';
import DashboardContent from './DashboardContent';
import SearchModal from '../search/SearchModal';

function DashboardLayout({ 
  children, 
  breadcrumbs = [{ label: 'Dashboard', path: '/dashboard' }],
  pendingCount = 0,
  isAvailable = true,
  onAvailabilityChange,
  searchData = {}  // NEW: { questions: [] }
}) {
  const navigate = useNavigate();
  const {
    sidebarCollapsed,
    toggleSidebar,
    mobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
  } = useDashboardLayout();

  const {
    searchQuery,
    setSearchQuery,
    isOpen: isSearchOpen,
    setIsOpen: setSearchOpen,
    close: closeSearch,
    searchResults,
    selectedIndex,
    moveSelection,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useSearch(searchData);

  const handleSearchSelect = (result) => {
    addRecentSearch(searchQuery);
    closeSearch();

    // Handle navigation
    if (result.type === 'question' || result.type === 'navigation') {
      navigate(result.action);
    } else if (result.type === 'action') {
      // Handle actions
      handleAction(result.action);
    }
  };

  const handleAction = (action) => {
    switch (action) {
      case 'toggle-availability':
        onAvailabilityChange?.(!isAvailable);
        break;
      case 'export-questions':
        // Trigger export
        console.log('Export questions');
        break;
      case 'view-profile':
        window.open(`/u/${window.location.pathname.split('/')[1]}`, '_blank');
        break;
      case 'copy-link':
        navigator.clipboard.writeText(window.location.href);
        break;
      default:
        console.log('Action:', action);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <DashboardSidebar 
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        pendingCount={pendingCount}
      />

      {/* Mobile Drawer */}
      <MobileDrawer 
        isOpen={mobileMenuOpen}
        onClose={closeMobileMenu}
        pendingCount={pendingCount}
      />

      {/* Top Bar */}
      <DashboardTopBar
        breadcrumbs={breadcrumbs}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        onToggleMobileMenu={toggleMobileMenu}
        isAvailable={isAvailable}
        onAvailabilityChange={onAvailabilityChange}
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Main Content */}
      <DashboardContent sidebarCollapsed={sidebarCollapsed}>
        {children}
      </DashboardContent>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={closeSearch}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        selectedIndex={selectedIndex}
        onSelect={handleSearchSelect}
        onMoveSelection={moveSelection}
        recentSearches={recentSearches}
        onRecentSearchClick={(query) => setSearchQuery(query)}
        onClearRecent={clearRecentSearches}
      />
    </div>
  );
}

export default DashboardLayout;