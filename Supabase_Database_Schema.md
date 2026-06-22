\## Table `unidades`



\### Columns



| Name | Type | Constraints |

|------|------|-------------|

| `id` | `int8` | Primary Identity |

| `name` | `text` |  |

| `type` | `text` |  |

| `bairro` | `text` |  |

| `cep` | `text` |  Nullable |

| `rua` | `text` |  Nullable |

| `lat` | `numeric` |  |

| `lng` | `numeric` |  |

| `phone` | `text` |  Nullable |

| `hours` | `text` |  Nullable |

| `target` | `text` |  Nullable |

| `urgency` | `bool` |  Nullable |

| `open24h` | `bool` |  Nullable |

| `created\_at` | `timestamptz` |  |



\## Table `services`



\### Columns



| Name | Type | Constraints |

|------|------|-------------|

| `id` | `int8` | Primary Identity |

| `unit\_id` | `int8` |  |

| `name` | `text` |  |

| `specialty` | `text` |  |

| `doctor` | `text` |  Nullable |

| `description` | `text` |  Nullable |

| `hours` | `text` |  Nullable |



\## Table `news`



\### Columns



| Name | Type | Constraints |

|------|------|-------------|

| `id` | `int8` | Primary Identity |

| `unit\_id` | `int8` |  |

| `title` | `text` |  |

| `content` | `text` |  |

| `date` | `text` |  |



\## Table `profiles`



\### Columns



| Name | Type | Constraints |

|------|------|-------------|

| `id` | `int8` | Primary Identity |

| `name` | `text` |  |

| `email` | `text` |  Unique |

| `password` | `text` |  |

| `role` | `text` |  |

| `unit\_id` | `int8` |  Nullable |

| `created\_at` | `timestamptz` |  |



\## Table `history`



\### Columns



| Name | Type | Constraints |

|------|------|-------------|

| `id` | `int8` | Primary |

| `user\_id` | `int8` |  Nullable |

| `action` | `text` |  |

| `table\_name` | `text` |  Nullable |

| `record\_id` | `int8` |  Nullable |

| `unit\_id` | `int8` |  Nullable |

| `timestamp` | `timestamptz` |  Nullable |

| `details` | `jsonb` |  Nullable |





