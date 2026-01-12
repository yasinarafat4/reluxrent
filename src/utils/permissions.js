// Check if co-host has a specific permission
function hasPermission(permissions, key) {
  if (!permissions) return false;
  return permissions[key] === true;
}

// Get all enabled permissions as an array of strings
function getEnabledPermissions(permissions) {
  if (!permissions) return [];
  return Object.entries(permissions)
    .filter(([_, value]) => value === true)
    .map(([key]) => key);
}

module.exports = {
  hasPermission,
  getEnabledPermissions,
};
