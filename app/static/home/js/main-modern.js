/**
 * 现代化商城交互脚本
 */

// ============ 工具函数 ============

/**
 * 显示成功提示
 */
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.insertBefore(alert, document.body.firstChild);
    setTimeout(() => alert.remove(), 3000);
}

/**
 * 显示错误提示
 */
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.insertBefore(alert, document.body.firstChild);
    setTimeout(() => alert.remove(), 3000);
}

/**
 * 确认对话框
 */
function showConfirm(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// ============ 购物车函数 ============

/**
 * 删除购物车商品
 */
function deleteCart() {
    const selectedItems = [];
    document.querySelectorAll('.cart-item-checkbox:checked').forEach(checkbox => {
        selectedItems.push(checkbox.value);
    });

    if (selectedItems.length === 0) {
        showError('请选择要删除的商品');
        return;
    }

    showConfirm('确定要删除选中的商品吗？', () => {
        selectedItems.forEach(itemId => {
            fetch(`/cart_delete/${itemId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 1) {
                    location.reload();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('删除失败，请重试');
            });
        });
    });
}

/**
 * 结账流程
 */
function zhifu() {
    const recevieName = document.getElementById('recevieName');
    const tel = document.getElementById('tel');
    const address = document.getElementById('address');

    // 验证收货人信息
    if (!recevieName || recevieName.value.trim() === '') {
        showError('收货人姓名不能为空！');
        recevieName && recevieName.focus();
        return;
    }

    if (!tel || tel.value.trim() === '') {
        showError('收货人手机不能为空！');
        tel && tel.focus();
        return;
    }

    if (!/^\d+$/.test(tel.value)) {
        showError('手机号请输入数字');
        tel.focus();
        return;
    }

    if (!address || address.value.trim() === '') {
        showError('收货人地址不能为空！');
        address && address.focus();
        return;
    }

    // 获取选中的商品
    const selectedItems = [];
    document.querySelectorAll('.cart-item-checkbox:checked').forEach(checkbox => {
        selectedItems.push(checkbox.value);
    });

    if (selectedItems.length === 0) {
        showError('请选择要结账的商品');
        return;
    }

    // 提交表单
    const form = document.getElementById('myform');
    if (form) {
        selectedItems.forEach(id => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'selected_items';
            input.value = id;
            form.appendChild(input);
        });
        form.submit();
    }
}

/**
 * 清空购物车
 */
function clearCart() {
    showConfirm('确定要清空购物车吗？', () => {
        window.location.href = window.location.pathname.replace('shopping_cart', 'cart_clear');
    });
}

// ============ 商品页面函数 ============

/**
 * 添加到购物车
 */
function addToCart(goodsId, number = 1) {
    if (!goodsId) {
        showError('商品不存在');
        return;
    }

    window.location.href = `/cart_add/?goods_id=${goodsId}&number=${number}`;
}

/**
 * 收藏商品
 */
function collectGoods(goodsId) {
    if (!goodsId) {
        showError('商品不存在');
        return;
    }

    fetch(`/collect/${goodsId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 1) {
            showSuccess('商品已收藏！');
        } else if (data.msg === '请登录') {
            showError('请先登录！');
            window.location.href = '/login';
        } else {
            showError(data.msg || '收藏失败');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError('收藏失败，请重试');
    });
}

/**
 * 取消收藏
 */
function uncollectGoods(goodsId) {
    if (!goodsId) {
        showError('商品不存在');
        return;
    }

    showConfirm('确定要取消收藏吗？', () => {
        fetch(`/collect_delete/${goodsId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 1) {
                showSuccess('已取消收藏');
                setTimeout(() => location.reload(), 800);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('操作失败，请重试');
        });
    });
}

// ============ 初始化 ============

document.addEventListener('DOMContentLoaded', function() {
    // 购物车总计计算
    const calculateCartTotal = () => {
        const totalPriceElement = document.getElementById('total_price');
        if (totalPriceElement) {
            let total = 0;
            document.querySelectorAll('.total').forEach(element => {
                total += parseFloat(element.getAttribute('value') || 0);
            });
            totalPriceElement.textContent = total.toFixed(2) + ' 元';
        }
    };

    calculateCartTotal();

    // 监听购物车复选框变化
    document.querySelectorAll('.cart-item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', calculateCartTotal);
    });

    // 销售徽章动画
    const hasPriceElements = document.querySelectorAll('.product-price');
    hasPriceElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.color = '#FF4444';
        });
        element.addEventListener('mouseleave', function() {
            this.style.color = '#FF6B6B';
        });
    });
});

// ============ 向后兼容性 ============

// 保持与现有代码的兼容性
if (typeof jQuery !== 'undefined') {
    jQuery(document).ready(function($) {
        // jBox 兼容性包装（如果需要）
    });
}
