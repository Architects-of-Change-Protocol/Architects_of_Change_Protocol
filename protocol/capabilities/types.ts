export type CapabilityResourceType = 'wallet' | 'portfolio' | 'insight';

export type CapabilityAccessLevel = 'read' | 'write';

export type CapabilitySensitivityLevel = 'low' | 'medium' | 'high';

export type ProtocolCapabilityDefinition = {
  id: string;
  description: string;
  resource_type: CapabilityResourceType;
  access_level: CapabilityAccessLevel;
  sensitivity_level: CapabilitySensitivityLevel;
  requires_user_consent: boolean;
};
