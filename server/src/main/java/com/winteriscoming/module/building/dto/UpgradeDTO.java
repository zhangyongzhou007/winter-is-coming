package com.winteriscoming.module.building.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 升级建筑请求参数
 */
@Data
public class UpgradeDTO {

    /** 用户建筑ID */
    @NotNull(message = "建筑ID不能为空")
    private Long userBuildingId;
}
