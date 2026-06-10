package com.winteriscoming.module.building.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 建造新建筑请求参数
 */
@Data
public class BuildDTO {

    /** 建筑key */
    @NotBlank(message = "建筑类型不能为空")
    private String buildingKey;

    /** 槽位编号 */
    @Min(value = 0, message = "槽位编号不合法")
    private Integer positionIndex;
}
