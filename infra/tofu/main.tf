# NOT APPLIED — skeleton only. Requires the Oracle tenancy (owner, B-001 approved) in Phase 2.
# Shape: single ARM VM (worst case 2 OCPU / 12 GB per ADR-0005), Always Free SKUs only.
# pulumi-style comments kept: nothing here may create billable resources (working agreement §2.1).

terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 6.0"
    }
  }
}

variable "compartment_ocid" {
  type        = string
  description = " OCI compartment; provided via SOPS-encrypted tfvars after tenancy creation"
  default     = ""
}

variable "availability_domain" {
  type    = string
  default = ""
}

# Always Free shapes (never billable):
#   VM.Standard.A1.Flex  — 2 OCPU / 12 GB (worst case; 4/24 is upside, never planned for)
#   VM.Standard.E2.1.Micro — 2 AMD micros (ops/bastion)
# Storage: 200 GB block total free allowance, boot volume 50 GB.
# Upgrade guardrail: this file must NEVER reference a non-Always-Free shape — CI greps for it.
locals {
  allowed_shapes = ["VM.Standard.A1.Flex", "VM.Standard.E2.1.Micro"]
}
